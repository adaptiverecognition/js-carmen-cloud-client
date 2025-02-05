/**
 * An object containing configuration options for the Vehicle API client.
 */
export interface VehicleAPIOptions {
  /**
   * The API key to be used for authentication.
   */
  apiKey: string;

  /**
   * The URL of the API endpoint to call. Optional
   * if `cloudServiceRegion` is also set. Overrides
   * `cloudServiceRegion` if both properties are set.
   */
  endpoint?: string;

  /**
   * The cloud service region to use - `"AUTO"` for latency-based
   * automatic routing (default), `"EU"` for Europe and `"US"` for
   * the United States. Has no effect if `endpoint` is also set.
   */
  cloudServiceRegion?: "AUTO" | "EU" | "US";

  /**
   * The expected geographic region of the license plates
   * in the uploaded image. You can either use one of the
   * presets in the `Locations` object or provide your own
   * settings in a `{ region: string; location?: string }`
   * object. `region` is required but `location` is optional.
   */
  inputImageLocation: InputImageLocation;

  /**
   * The region of interest in the image to be analyzed.
   */
  regionOfInterest?: RegionOfInterest;

  /**
   * The services to use. At least one of `anpr` (Automated
   * Number Plate Recognition), `mmr` (Make and Model Recognition)
   * and `adr` (Dangerous Goods Pictogram Recognition) must
   * be specified.
   */
  services: SelectedServices;

  /**
   * The service uses your call statistics, which were generated
   * based on the list of locations (countries and states)
   * determined when reading your previously sent images, to decide
   * which ANPR engines should be run when processing your uploaded
   * images. If you want the service to ignore your call statistics,
   * for example because you use the service with images from
   * different locations around the world, you can turn this feature
   * off by setting the property value to `true`.
   */
  disableCallStatistics?: boolean;

  /**
   * The service resizes large images to Full HD resolution by bicubic
   * interpolation. Resizing can make reading many times faster, but
   * it can reduce the recognition efficiency. If you don't want the
   * service to resize your images, turn this feature on by setting the
   * property value to `true`. By disabling image resizing, you may also
   * need to enable wide range analysis.
   */
  disableImageResizing?: boolean;

  /**
   * If you cannot guarantee that the uploaded image meets all the
   * required parameters (see the Input Images tab on the How To Use page),
   * you can turn on the wide-range analysis by setting this property's
   * value to `true`. Attention! The duration of the analysis may increase
   * several times.
   */
  enableWideRangeAnalysis?: boolean;

  /**
   * If you want to receive text results read from unidentified license
   * plate types as well, you can turn this feature on by setting the
   * property value to true. Attention! The number of false positives can
   * be much higher.
   */
  enableUnidentifiedLicensePlate?: boolean;

  /**
   * An optional parameter, it specifies the maximum number of
   * vehicle/license plate searches per image. Use this parameter
   * carefully, because every search increases the processing time.
   * The system will stop searching when there is no more vehicle/license
   * plate in the image, or the number of searches reaches the value of
   * `maxreads`. Its value is `1` by default, the maximum is `5`.
   */
  maxReads?: number;

  /**
   * How many times the request should be retried in case of a 5XX response
   * status code. Default: 3.
   */
  retryCount?: number;
}

/**
 * Specifies the recognition services to call on the input image.
 */
export interface SelectedServices {
  /**
   * Automatic Number Plate Recognition
   */
  anpr?: boolean;

  /**
   * Make and Model Recognition
   */
  mmr?: boolean;

  /**
   * Dangerous Goods Pictogram Recognition
   */
  adr?: boolean;
}

/**
 * Represents the geographic location where the input image was taken.
 */
export interface InputImageLocation {
  /**
   * The expected geographic region (continent) of the input image.
   */
  region: string;

  /**
   * The expected geographic location (country or state) of the input
   * image.
   */
  location?: string;
}

/**
 * Represents the region of interest to be analyzed in the input image.
 * The coordinates are given as `[x, y]` pairs.
 */
export interface RegionOfInterest {
  /**
   * The top-left corner of the region of interest.
   */
  topLeft: [number, number];

  /**
   * The top-right corner of the region of interest.
   */
  topRight: [number, number];

  /**
   * The bottom-right corner of the region of interest.
   */
  bottomRight: [number, number];

  /**
   * The bottom-left corner of the region of interest.
   */
  bottomLeft: [number, number];
}

/**
 * An object which contains all accepted region/location pairs.
 */
export const Locations: Record<string, Record<string, InputImageLocation>> = {
  Europe: {
    Hungary: { region: "EUR", location: "HUN" },
    Austria: { region: "EUR", location: "AUT" },
    Slovakia: { region: "EUR", location: "SVK" },
    Czechia: { region: "EUR", location: "CZE" },
    Slovenia: { region: "EUR", location: "SVN" },
    Poland: { region: "EUR", location: "POL" },
    Estonia: { region: "EUR", location: "EST" },
    Latvia: { region: "EUR", location: "LVA" },
    Lithuania: { region: "EUR", location: "LTU" },
    Romania: { region: "EUR", location: "ROU" },
    Bulgaria: { region: "EUR", location: "BGR" },
    Croatia: { region: "EUR", location: "HRV" },
    BosniaHerzegovina: { region: "EUR", location: "BIH" },
    Serbia: { region: "EUR", location: "SRB" },
    NorthMacedonia: { region: "EUR", location: "MKD" },
    Montenegro: { region: "EUR", location: "MNE" },
    Albania: { region: "EUR", location: "ALB" },
    Greece: { region: "EUR", location: "GRC" },
    Turkey: { region: "EUR", location: "TUR" },
    Netherlands: { region: "EUR", location: "NLD" },
    Luxembourg: { region: "EUR", location: "LUX" },
    Germany: { region: "EUR", location: "DEU" },
    Belgium: { region: "EUR", location: "BEL" },
    France: { region: "EUR", location: "FRA" },
    FranceOverseasTerritories: { region: "EUR", location: "FRA_OT" },
    Switzerland: { region: "EUR", location: "CHE" },
    Italy: { region: "EUR", location: "ITA" },
    Portugal: { region: "EUR", location: "PRT" },
    Spain: { region: "EUR", location: "ESP" },
    EuropeanOrganization: { region: "EUR", location: "NONE" },
    Denmark: { region: "EUR", location: "DNK" },
    DenmarkFaroe: { region: "EUR", location: "FRO" },
    DenmarkGreenland: { region: "EUR", location: "GRL" },
    Norway: { region: "EUR", location: "NOR" },
    Sweden: { region: "EUR", location: "SWE" },
    Finland: { region: "EUR", location: "FIN" },
    FinlandAland: { region: "EUR", location: "FIN" },
    GreatBritain: { region: "EUR", location: "GBR" },
    Gibraltar: { region: "EUR", location: "GIB" },
    IsleOfMan: { region: "EUR", location: "IMN" },
    Jersey: { region: "EUR", location: "JEY" },
    Guernsey: { region: "EUR", location: "GGY" },
    Alderney: { region: "EUR", location: "ALD" },
    GreatBritainNorthernIreland: { region: "EUR", location: "NIR" },
    Ireland: { region: "EUR", location: "IRL" },
    Russia: { region: "EUR", location: "RUS" },
    Ukraine: { region: "EUR", location: "UKR" },
    UkraineLuhansk: { region: "EUR", location: "UKR" },
    UkraineDonetsk: { region: "EUR", location: "UKR" },
    Moldova: { region: "EUR", location: "MDA" },
    MoldovaTransnistria: { region: "EUR", location: "MDA" },
    Belarus: { region: "EUR", location: "BLR" },
    Georgia: { region: "EUR", location: "GEO" },
    GeorgiaAbkhazia: { region: "EUR", location: "GEO" },
    GeorgiaSouthOssetia: { region: "EUR", location: "GEO" },
    Azerbaijan: { region: "EUR", location: "AZE" },
    Armenia: { region: "EUR", location: "ARM" },
    Kazakhstan: { region: "CAS", location: "KAZ" },
    Andorra: { region: "EUR", location: "AND" },
    Monaco: { region: "EUR", location: "MCO" },
    Liechtenstein: { region: "EUR", location: "LIE" },
    SanMarino: { region: "EUR", location: "SMR" },
    VaticanCity: { region: "EUR", location: "VAT" },
    Kosovo: { region: "EUR", location: "RKS" },
    Iceland: { region: "EUR", location: "ISL" },
    Malta: { region: "EUR", location: "MLT" },
    CyprusSouthCyprus: { region: "EUR", location: "CYP" },
    CyprusUNCyprus: { region: "EUR", location: "NONE" },
    CyprusNorthCyprus: { region: "EUR", location: "CYP" },
    SvalbardAndJanMayen: { region: "EUR", location: "SJM" },
  },
  NorthAmerica: {
    UnitedStatesOfAmericaGovernment: { region: "NAM", location: "NONE" },
    UnitedStatesOfAmericaColumbia: { region: "NAM", location: "US-DC" },
    UnitedStatesOfAmericaAlaska: { region: "NAM", location: "US-AK" },
    UnitedStatesOfAmericaWashington: { region: "NAM", location: "US-WA" },
    UnitedStatesOfAmericaOregon: { region: "NAM", location: "US-OR" },
    UnitedStatesOfAmericaCalifornia: { region: "NAM", location: "US-CA" },
    UnitedStatesOfAmericaIdaho: { region: "NAM", location: "US-ID" },
    UnitedStatesOfAmericaNevada: { region: "NAM", location: "US-NV" },
    UnitedStatesOfAmericaMontana: { region: "NAM", location: "US-MT" },
    UnitedStatesOfAmericaWyoming: { region: "NAM", location: "US-WY" },
    UnitedStatesOfAmericaUtah: { region: "NAM", location: "US-UT" },
    UnitedStatesOfAmericaArizona: { region: "NAM", location: "US-AZ" },
    UnitedStatesOfAmericaNorthDakota: { region: "NAM", location: "US-ND" },
    UnitedStatesOfAmericaSouthDakota: { region: "NAM", location: "US-SD" },
    UnitedStatesOfAmericaNebraska: { region: "NAM", location: "US-NE" },
    UnitedStatesOfAmericaColorado: { region: "NAM", location: "US-CO" },
    UnitedStatesOfAmericaNewMexico: { region: "NAM", location: "US-NM" },
    UnitedStatesOfAmericaKansas: { region: "NAM", location: "US-KS" },
    UnitedStatesOfAmericaOklahoma: { region: "NAM", location: "US-OK" },
    UnitedStatesOfAmericaTexas: { region: "NAM", location: "US-TX" },
    UnitedStatesOfAmericaArkansas: { region: "NAM", location: "US-AR" },
    UnitedStatesOfAmericaMinnesota: { region: "NAM", location: "US-MN" },
    UnitedStatesOfAmericaWisconsin: { region: "NAM", location: "US-WI" },
    UnitedStatesOfAmericaIowa: { region: "NAM", location: "US-IA" },
    UnitedStatesOfAmericaIllinois: { region: "NAM", location: "US-IL" },
    UnitedStatesOfAmericaMissouri: { region: "NAM", location: "US-MO" },
    UnitedStatesOfAmericaMichigan: { region: "NAM", location: "US-MI" },
    UnitedStatesOfAmericaIndiana: { region: "NAM", location: "US-IN" },
    UnitedStatesOfAmericaOhio: { region: "NAM", location: "US-OH" },
    UnitedStatesOfAmericaKentucky: { region: "NAM", location: "US-KY" },
    UnitedStatesOfAmericaAlabama: { region: "NAM", location: "US-AL" },
    UnitedStatesOfAmericaTennessee: { region: "NAM", location: "US-TN" },
    UnitedStatesOfAmericaLouisiana: { region: "NAM", location: "US-LA" },
    UnitedStatesOfAmericaMississippi: { region: "NAM", location: "US-MS" },
    UnitedStatesOfAmericaMaine: { region: "NAM", location: "US-ME" },
    UnitedStatesOfAmericaVermont: { region: "NAM", location: "US-VT" },
    UnitedStatesOfAmericaNewHampshire: { region: "NAM", location: "US-NH" },
    UnitedStatesOfAmericaConnecticut: { region: "NAM", location: "US-CT" },
    UnitedStatesOfAmericaMassachusetts: { region: "NAM", location: "US-MA" },
    UnitedStatesOfAmericaRhodeIsland: { region: "NAM", location: "US-RI" },
    UnitedStatesOfAmericaNewYork: { region: "NAM", location: "US-NY" },
    UnitedStatesOfAmericaNewJersey: { region: "NAM", location: "US-NJ" },
    UnitedStatesOfAmericaDelaware: { region: "NAM", location: "US-DE" },
    UnitedStatesOfAmericaPennsylvania: { region: "NAM", location: "US-PA" },
    UnitedStatesOfAmericaMaryland: { region: "NAM", location: "US-MD" },
    UnitedStatesOfAmericaVirginia: { region: "NAM", location: "US-VA" },
    UnitedStatesOfAmericaWestVirginia: { region: "NAM", location: "US-WV" },
    UnitedStatesOfAmericaNorthCarolina: { region: "NAM", location: "US-NC" },
    UnitedStatesOfAmericaSouthCarolina: { region: "NAM", location: "US-SC" },
    UnitedStatesOfAmericaGeorgia: { region: "NAM", location: "US-GA" },
    UnitedStatesOfAmericaFlorida: { region: "NAM", location: "US-FL" },
    UnitedStatesOfAmericaHawaii: { region: "NAM", location: "US-HI" },
    UnitedStatesOfAmericaPuertoRico: { region: "NAM", location: "US-PR" },
    UnitedStatesOfAmericaGuam: { region: "NAM", location: "US-GU" },
    UnitedStatesOfAmericaAmericanSamoa: { region: "NAM", location: "US-AS" },
    UnitedStatesOfAmericaVirginIslands: { region: "NAM", location: "US-VI" },
    UnitedStatesOfAmericaNorthernMarianaIslands: {
      region: "NAM",
      location: "US-MP",
    },
    CanadaFederal: { region: "NAM", location: "NONE" },
    CanadaBritishColumbia: { region: "NAM", location: "CA-BC" },
    CanadaAlberta: { region: "NAM", location: "CA-AB" },
    CanadaSaskatchewan: { region: "NAM", location: "CA-SK" },
    CanadaManitoba: { region: "NAM", location: "CA-MB" },
    CanadaOntario: { region: "NAM", location: "CA-ON" },
    CanadaQuebec: { region: "NAM", location: "CA-QC" },
    CanadaNovaScotia: { region: "NAM", location: "CA-NS" },
    CanadaNewBrunswick: { region: "NAM", location: "CA-NB" },
    CanadaNewfoundlandLabrador: { region: "NAM", location: "CA-NL" },
    CanadaNorthWestTerritories: { region: "NAM", location: "CA-NT" },
    CanadaNunavut: { region: "NAM", location: "CA-NU" },
    CanadaPrinceEdouardIsland: { region: "NAM", location: "CA-PE" },
    CanadaYukon: { region: "NAM", location: "CA-YT" },
  },
  CentralAmerica: {
    Guatemala: { region: "CAM", location: "GTM" },
    Belize: { region: "CAM", location: "BLZ" },
    ElSalvador: { region: "CAM", location: "SLV" },
    Nicaragua: { region: "CAM", location: "NIC" },
    Honduras: { region: "CAM", location: "HND" },
    CostaRica: { region: "CAM", location: "CRI" },
    Panama: { region: "CAM", location: "PAN" },
    Mexico: { region: "CAM", location: "MEX" },
  },
  SouthAmerica: {
    Colombia: { region: "SAM", location: "COL" },
    Venezuela: { region: "SAM", location: "VEN" },
    Guyana: { region: "SAM", location: "GUY" },
    Suriname: { region: "SAM", location: "SUR" },
    Peru: { region: "SAM", location: "PER" },
    Brazil: { region: "SAM", location: "BRA" },
    Ecuador: { region: "SAM", location: "ECU" },
    Bolivia: { region: "SAM", location: "BOL" },
    Paraguay: { region: "SAM", location: "PRY" },
    Chile: { region: "SAM", location: "CHL" },
    Argentina: { region: "SAM", location: "ARG" },
    Uruguay: { region: "SAM", location: "URY" },
    FalklandIslands: { region: "SAM", location: "FLK" },
  },
  CentralAsia: {
    Uzbekistan: { region: "CAS", location: "UZB" },
    Turkmenistan: { region: "CAS", location: "TKM" },
    Tajikistan: { region: "CAS", location: "TJK" },
    Kyrgyzstan: { region: "CAS", location: "KGZ" },
    Mongolia: { region: "CAS", location: "MNG" },
    Afghanistan: { region: "CAS", location: "AFG" },
  },
  EastAsia: {
    China: { region: "EAS", location: "CHN" },
    HongKong: { region: "EAS", location: "HKG" },
    Macau: { region: "EAS", location: "MAC" },
    KoreaSouth: { region: "EAS", location: "KOR" },
    KoreaNorth: { region: "EAS", location: "PRK" },
  },
  SouthAsia: {
    Thailand: { region: "SAS", location: "THA" },
    Malaysia: { region: "SAS", location: "MYS" },
    Singapore: { region: "SAS", location: "SGP" },
    Myanmar: { region: "SAS", location: "MMR" },
    Laos: { region: "SAS", location: "LAO" },
    Cambodia: { region: "SAS", location: "KHM" },
    Vietnam: { region: "SAS", location: "VNM" },
    Brunei: { region: "SAS", location: "BRN" },
    ChristmasIsland: { region: "SAS", location: "CXR" },
    KeelingIslands: { region: "SAS", location: "CCK" },
    Indonesia: { region: "SAS", location: "IDN" },
    PapuaNewGuinea: { region: "SAS", location: "PNG" },
  },
  MiddleEast: {
    Syria: { region: "ME", location: "SYR" },
    Lebanon: { region: "ME", location: "LBN" },
    Jordan: { region: "ME", location: "JOR" },
    SaudiArabia: { region: "ME", location: "SAU" },
    Kuwait: { region: "ME", location: "KWT" },
    UnitedArabEmirates: { region: "ME", location: "ARE" },
    Qatar: { region: "ME", location: "QAT" },
    Bahrain: { region: "ME", location: "BHR" },
    Oman: { region: "ME", location: "OMN" },
    Yemen: { region: "ME", location: "YEM" },
  },
  AustraliaAndOceania: {
    AustraliaUnknown: { region: "AUS", location: "NONE" },
    AustraliaFederalInterstate: { region: "AUS", location: "NONE" },
    AustraliaGovernment: { region: "AUS", location: "NONE" },
    AustraliaCapitalTerritory: { region: "AUS", location: "AU-ACT" },
    AustraliaNorthernTerritory: { region: "AUS", location: "AU-NT" },
    AustraliaNewSouthWales: { region: "AUS", location: "AU-NSW" },
    AustraliaQueensland: { region: "AUS", location: "AU-QLD" },
    AustraliaSouthAustralia: { region: "AUS", location: "AU-SA" },
    AustraliaTasmania: { region: "AUS", location: "AU-TAS" },
    AustraliaVictoria: { region: "AUS", location: "AU-VIC" },
    AustraliaWesternAustralia: { region: "AUS", location: "AU-WA" },
  },
};
