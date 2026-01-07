interface AppConfig {
    baseApiUrl: string;
    baseUrl: string;
    wssBaseUrl: string;
    stripePublishableKey: string;
    googleClientId: string;
    facebookAppId: string;
    facebookAppSecret: string;
}

const appConfig = {
    baseApiUrl: "http://localhost:22081",
    wssBaseUrl: "ws://localhost:22081",
    baseUrl: "https://localhost:3000",
    googleClientId: "266201734935-ruucr20aupn1aasfqckofbhakq6ir69o.apps.googleusercontent.com",
    facebookAppId: "4262732524046315",
    facebookAppSecret: "4bce02a66092621e179d5d8f1f944d3e",
    stripePublishableKey: "pk_test_51N808IGg0tCTvsYGH3OhZFyzRTTdz7Pgu2stIPAP8nb74sj8UIc8aZM4ULzLP4ZVUAWsd4Sh2tsFCOLQbRvz2sby00XzXafQEs",
} as AppConfig

export default appConfig
