const {funcer} = require("./funcer");
const {
    TON, COLLECTION_ADDRESS, OWNER_ADDRESS, USER_ADDRESS, YEAR, FC_ITEM, makeStorageItem, AUCTION_START_TIME
} = require("./utils");

funcer({'logVmOps': false, 'logFiftCode': false}, {
    'path': './func/',
    'fc': FC_ITEM,
    'data': makeStorageItem({}),
    'in_msgs': [
        {
            "time": AUCTION_START_TIME + 1,
            "sender": '0:' + COLLECTION_ADDRESS,
            "amount": 1000 * TON,
            "body": [
                'Address', '0:' + USER_ADDRESS,
                'cell', [
                    'string', 'alice'
                ],
            ],
            "new_data": makeStorageItem({}),
            "out_msgs": [
                {
                    "type": "Internal",
                    "to": "0:" + USER_ADDRESS,
                    "amount": 0 * TON,
                    "sendMode": 64,
                    "body": [
                        "uint32", 0, // op
                        "uint64", 999, // query_id
                    ],
                }
            ]
        },
    ]
});

