const {funcer} = require("./funcer");
const {
    makeStorageItemNonInit, FC_COLLECTION, DNS_NEXT_RESOLVER_PREFIX, AUCTION_START_DURATION,
    TON, COLLECTION_ADDRESS, OWNER_ADDRESS, USER_ADDRESS, YEAR, FC_ITEM, makeStorageItem, AUCTION_PROLONGATION, CONTENT,
    AUCTION_START_TIME
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
            'Address', '0:' + USER_ADDRESS, // max_bid_address
            'coins', 2000 * TON, // max_bid_amount
            'uint64', auctionEndTime || (AUCTION_START_TIME + AUCTION_START_DURATION) // auction_end_time
        ],
        'uint64', AUCTION_START_TIME // last_fill_up_time
    ];
}


funcer({'logVmOps': false, 'logFiftCode': false}, {
    'path': './func/',
    'fc': FC_ITEM,
    'data': makeStorageItem({auctionEndTime: AUCTION_START_TIME + AUCTION_PROLONGATION / 2}),
    'in_msgs': [
        {
            "time": AUCTION_START_TIME,
            "contract_balance": 1000 * TON,
            "sender": '0:' + USER_ADDRESS,
            "amount": 2000 * TON,
            "body": [],
            "new_data": makeStorageItem2({
                auctionEndTime: AUCTION_START_TIME + AUCTION_PROLONGATION
            }),
            "out_msgs": [
                {
                    "type": "Internal",
                    "to": "0:" + OWNER_ADDRESS,
                    "amount": 999 * TON,
                    "sendMode": 1,
                    "body": [
                        "uint32", 0x557cea20, // op
                        "uint64", 999, // query_id
                    ],
                },
            ]
        },
    ]
});

