const restaurantId = process.env.TOTEAT_RESTAURANT_ID;
const apiBase = "https://toteatglobal.appspot.com/mw/or/1.0";

const buildOrderUrl = (locationId, token) =>
    `${apiBase}/orders?xir=${restaurantId}&xil=${locationId}&xiu=1001&xapitoken=${token}`;

export const TOTEAT_CONFIG = {
    restaurantId,
    apiUrl: apiBase,
    locations: {
        "01": {
            name: "Dr. Fries 01",
            localNumber: "1",
            xir: restaurantId,
            xil: "1",
            xiu: "1001",
            xapitoken: process.env.TOTEAT_TOKEN_01,
            orderUrl: buildOrderUrl("1", process.env.TOTEAT_TOKEN_01)
        },
        "02": {
            name: "Dr. Fries 02",
            localNumber: "2",
            xir: restaurantId,
            xil: "2",
            xiu: "1001",
            xapitoken: process.env.TOTEAT_TOKEN_02,
            orderUrl: buildOrderUrl("2", process.env.TOTEAT_TOKEN_02)
        },
        "05": {
            name: "Dr. Fries Concepcion",
            localNumber: "5",
            xir: restaurantId,
            xil: "5",
            xiu: "1001",
            xapitoken: process.env.TOTEAT_TOKEN_05,
            orderUrl: buildOrderUrl("5", process.env.TOTEAT_TOKEN_05)
        }
    }
};