const {funcer} = require("./funcer");
const {
    makeStorageCollection, FC_COLLECTION, TON,  COLLECTION_ADDRESS, AUCTION_START_TIME, USER_ADDRESS,
} = require("./utils");

const storage = () => {
    return makeStorageCollection({});
}

funcer({'logVmOps': false, 'logFiftCode': false}, {
    'path': './func/',
    'fc': FC_COLLECTION,
    "configParams": {
        80: [
            'cell', [
                "uint256->cell", {
                    '38930916800118655128984401856443062677799436388671332167772672007419684920584': [
                        'uint8', 1
                    ]
                }
            ]
        ]
    },
    'data': storage(),
    'in_msgs': [
        {
            "time": AUCTION_START_TIME + 1,
            "sender": '0:' + USER_ADDRESS,
            "amount": 1000 * TON,
            "body": [
                'uint32', 0,
                'string', "alice",
            ],
            "new_data": storage(),
            "exit_code": 205
        },
        {
            "time": AUCTION_START_TIME + 1,
            "sender": '0:' + USER_ADDRESS,
            "amount": 1000 * TON,
            "body": [
                'uint32', 0,
                'string', "alice2",
            ],
            "new_data": storage(),
            "exit_code": 0
        },
    ]
});

