#!/usr/bin/env python3
"""Build the OpenAPI 3.0 documents the client libraries are generated from.

Input: the ApiDocSpec objects captured from carmen-cloud-cdk by dump-cdk-api-docs.ts
(the same specs CDK publishes as API Gateway documentation).

Output: openapi/carmen-cloud.json and openapi/authentication.json, restricted to the
bearer-token surface an API-key client can reach (the SigV4 console routes are left out).

Usage: build_openapi.py <specs.json> <out-dir>
"""
import json
import sys

SERVER = "https://api.carmencloud.com"
BEARER_MARKER = "workspace bearer token"
USER_SESSION_MARKER = "user session"
# Query parameters documented as numbers (API Gateway docs carry no parameter types).
INTEGER_PARAMS = {"limit"}


def schema_ref(name):
    return {"$ref": f"#/components/schemas/{name}"}


def operation(m, security):
    params = []
    for where, key in (("path", "pathParams"), ("query", "queryParams"), ("header", "headerParams")):
        for p in m.get(key, []) or []:
            params.append({
                "name": p["name"],
                "in": where,
                "required": True if where == "path" else bool(p.get("required")),
                "description": p.get("description", ""),
                "schema": {"type": "integer"} if p["name"] in INTEGER_PARAMS else {"type": "string"},
            })
    op = {
        "operationId": m["operationId"],
        "summary": m.get("summary", ""),
        "description": m.get("description", ""),
        "tags": m.get("tags", []),
        "parameters": params,
        "responses": {},
    }
    if USER_SESSION_MARKER in (m.get("description") or ""):
        op["x-requires-user-session"] = True
    if security is not None:
        op["security"] = security
    if m.get("requestBody"):
        op["requestBody"] = {
            "required": True,
            "description": m["requestBody"].get("description", ""),
            "content": {"application/json": {"schema": schema_ref(m["requestBody"]["schema"])}},
        }
    for r in m["responses"]:
        resp = {"description": r["description"]}
        if r.get("schema"):
            resp["content"] = {"application/json": {"schema": schema_ref(r["schema"])}}
        if r.get("headers"):
            resp["headers"] = {h: {"description": d, "schema": {"type": "string"}} for h, d in r["headers"].items()}
        op["responses"][r["status"]] = resp
    return op


def document(spec, title, base_path, keep, security, security_schemes):
    paths = {}
    used = set()
    for m in spec["methods"]:
        if not keep(m):
            continue
        paths.setdefault(m["path"], {})[m["method"].lower()] = operation(m, security)
        used.update(_refs(m))
    schemas = dedupe_inline_schemas({k: v for k, v in spec["schemas"].items() if k in used})
    doc = {
        "openapi": "3.0.3",
        "info": {"title": title, "version": "1.0.0", "description": spec["description"]},
        "servers": [{"url": SERVER + base_path}],
        "paths": dict(sorted(paths.items())),
        "components": {"schemas": dict(sorted(schemas.items()))},
    }
    if security_schemes:
        doc["components"]["securitySchemes"] = security_schemes
    return doc


def dedupe_inline_schemas(schemas):
    """Replaces inline copies of named schemas (e.g. array items) with $refs,
    so generators emit one type per schema instead of anonymous duplicates."""
    canon = {json.dumps(v, sort_keys=True): k for k, v in schemas.items()}

    def walk(node, top):
        if isinstance(node, dict):
            if not top:
                name = canon.get(json.dumps(node, sort_keys=True))
                if name:
                    return schema_ref(name)
            return {k: walk(v, False) for k, v in node.items()}
        if isinstance(node, list):
            return [walk(v, False) for v in node]
        return node

    return {k: open_response_enums(k, mark_nullable(walk(v, True))) for k, v in schemas.items()}


# Response properties whose documented enum is narrower than what the API returns
# (dev returns e.g. a lowercase legacy `owner` key role). They are typed as plain
# strings so clients that validate responses do not reject them.
OPEN_RESPONSE_ENUMS = {
    "ApiKey": {"role"},
    "InvitationSentResult": {"role"},
    "WorkspaceUser": {"role"},
}


def open_response_enums(name, schema):
    for prop_name in OPEN_RESPONSE_ENUMS.get(name, ()):
        prop = (schema.get("properties") or {}).get(prop_name)
        if prop and "enum" in prop:
            values = ", ".join(f"`{v}`" for v in prop.pop("enum"))
            prop["description"] = f"{prop.get('description', '').rstrip()} Known values: {values}; others may appear.".strip()
    return schema


def mark_nullable(node):
    """Properties documented as possibly `null` (the doc specs carry no nullability) get `nullable: true`."""
    if isinstance(node, dict):
        for prop in (node.get("properties") or {}).values():
            if isinstance(prop, dict) and "`null`" in prop.get("description", "") and "$ref" not in prop:
                prop["nullable"] = True
        for v in node.values():
            mark_nullable(v)
    elif isinstance(node, list):
        for v in node:
            mark_nullable(v)
    return node


def _refs(m):
    out = {r["schema"] for r in m["responses"] if r.get("schema")}
    if m.get("requestBody"):
        out.add(m["requestBody"]["schema"])
    return out


def main(specs_path, out_dir):
    specs = json.load(open(specs_path))
    workspace = specs["workspace:ApiDocs"]
    auth = specs["auth:AuthApiDocs"]
    docs = {
        "carmen-cloud.json": document(
            workspace, "Carmen Cloud API", "/workspace",
            keep=lambda m: BEARER_MARKER in (m.get("description") or ""),
            security=[{"bearerAuth": []}],
            security_schemes={"bearerAuth": {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"}},
        ),
        "authentication.json": document(
            auth, "Carmen Cloud Authentication", "/auth",
            keep=lambda m: True, security=None, security_schemes=None,
        ),
    }
    for name, doc in docs.items():
        with open(f"{out_dir}/{name}", "w") as f:
            json.dump(doc, f, indent=2, ensure_ascii=False)
            f.write("\n")
        ops = sum(len(v) for v in doc["paths"].values())
        print(f"{name}: {ops} operations, {len(doc['components']['schemas'])} schemas")


if __name__ == "__main__":
    main(*sys.argv[1:3])
