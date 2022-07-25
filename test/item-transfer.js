const {funcer} = require("./funcer");
const {
    TON, COLLECTION_ADDRESS, OWNER_ADDRESS, USER_ADDRESS, YEAR, FC_ITEM, makeStorageItem,
    makeStorageItemComplete, CONTENT, AUCTION_START_TIME
} = require("./utils");

const makeStorageItem2 = ({auctionEndTime}) => {
    return [
        "uint256", '38930916800118655128984401856443062677799436388671332167772672007419684920584', // index,
        "Address", '0:' + COLLECTION_ADDRESS, // collection_address
        "Address", '0:' + USER_ADDRESS, // owner_address
        'cell', CONTENT,
        'cell', [ // domain
            'string', 'alice',
        ],
        'uint1', 0, // auction maybe
        'uint64', AUCTION_START_TIME // last_fill_up_time
    ];
}


funcer({'logVmOps': false, 'logFiftCode': false}, {
    'path': './func/',
    'fc': FC_ITEM,
    'data': makeStorageItemComplete({}),
    'in_msgs': [
        {
            "time": AUCTION_START_TIME,
            "contract_balance": 1000 * TON,
            "sender": '0:' + OWNER_ADDRESS,
            "amount": 1 * TON,
            "body": [
                'uint32', 0x5fcc3d14,
                'uint64', 123,
                'Address', '0:' + USER_ADDRESS, // new_owner_address
                'uint2', 0, // response_address
                'uint1', 0, // custom_payload
                'coins', 0.5 * TON, // forward_amount
                'uint1', 0 // forward_payload
            ],
            "new_data": makeStorageItem2({}),
            "out_msgs": [
                {
                    "type": "Internal",
                    "to": "0:" + USER_ADDRESS,
                    "amount": 0.5 * TON,
                    "sendMode": 1,
                    "body": [
                        "uint32", 0x05138d91, // op
                        "uint64", 123, // query_id
                        "Address", '0:' + OWNER_ADDRESS,
                        'uint1', 0
                    ],
                },
            ]
        },
    ]
});

