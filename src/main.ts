import * as dotenv from "dotenv";
import { DescriptorAPIClient, DescriptorAPIOptions } from ".";

dotenv.config();

async function main() {
  const options: DescriptorAPIOptions = {
    apiKey: "14kyB65n7b9EfAB6wb3xjar05v1G9QTi3KEcGBG0",
    endpoint: "https://api.dev.carmencloud.com",
  };
  const client = new DescriptorAPIClient(options);
  // const apis = await client.getApis({
  //     detailed: true,
  //     api: 'vehicle'
  // });

  // console.log(apis);

  // const dimensions = await client.getDimensions();
  // console.log(dimensions);

  // const freeCallCount = await client.getFreeCallCount('carmen');
  // console.log(freeCallCount);

  // const paidSubscriptionUsage = await client.getPaidSubscriptionUsage('carmen');
  // console.log(paidSubscriptionUsage);

  // const paidSubscriptions = await client.getPaidSubscriptions();
  // console.log(paidSubscriptions);

  const prices = await client.getPrices('carmen', 'HU');
  console.log(JSON.stringify(prices, null, 2));

  // const products = await client.getProducts();
  // console.log(JSON.stringify(products, null, 2));

  // const region = await client.getRegion();
  // console.log(region);

  // const usagePlanSubscriptions = await client.getUsagePlanSubscriptions();
  // console.log(usagePlanSubscriptions);

  // const usagePlanUsage = await client.getUsagePlanUsage();
  // console.log(usagePlanUsage);

  // const usagePlans = await client.getUsagePlans();
  // console.log(usagePlans);
}

main().catch(console.error);
