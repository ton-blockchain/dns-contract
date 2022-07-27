const {funcer} = require("./funcer");
const {
    makeStorageItemNonInit,
    FC_COLLECTION,
    DNS_NEXT_RESOLVER_PREFIX,
    AUCTION_START_DURATION,
    TON,
    COLLECTION_ADDRESS,
    OWNER_ADDRESS,
    USER_ADDRESS,
    YEAR,
    FC_ITEM,
    makeStorageItemComplete,
    makeStorageItem, CONTENT, AUCTION_START_TIME
} = require("./utils");

const makeStorageItem2 = ({auctionEndTime}) => {
    return [
        "uint256", '38930916800118655128984401856443062677799436388671332167772672007419684920584', // index,
        "Address", '0:' + COLLECTION_ADDRESS, // collection_address
        "uint2", '0', // owner_address - zero address
        'cell', CONTENT,
        'cell', [ // domain
            'string', 'alice',
        ],
        'uint1', 1, // auction maybe
        'cell', [ // auction
            'Address', '0:' + OWNER_ADDRESS, // max_bid_address
            'coins', 500 * TON, // max_bid_amount
            'uint64', (AUCTION_START_TIME + AUCTION_START_DURATION) // auction_end_time
        ],
        'uint64', AUCTION_START_TIME - YEAR - 1 // last_fill_up_time
    ];
}


funcer({'logVmOps': false, 'logFiftCode': false}, {
    'path': './func/',
    'fc': FC_ITEM,
    'data': makeStorageItemComplete({lastFillUpTime: AUCTION_START_TIME - YEAR - 1}),
    'in_msgs': [
        {
            "time": AUCTION_START_TIME,
            "sender": '0:' + USER_ADDRESS,
            "contract_balance": 1000 * TON,
            "amount": 1 * TON,
            "body": [
                "uint32", 12,
                "uint64", 123,
            ],
            "new_data": makeStorageItem2({}),
            "out_msgs": [
                {
                    "type": "Internal",
                    "to": "0:" + OWNER_ADDRESS,
                    "amount": 998 * TON,
                    "sendMode": 2,
                    "body": [
                        "uint32", 0xd53276db, // op
                        "uint64", 123, // query_id
                    ],
                },
            ]
        },
        ]
});

