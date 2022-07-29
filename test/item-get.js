const {funcer} = require("./funcer");
const {
    makeStorageItemNonInit, FC_COLLECTION, DNS_NEXT_RESOLVER_PREFIX, AUCTION_START_DURATION,
    TON, COLLECTION_ADDRESS, OWNER_ADDRESS, USER_ADDRESS, YEAR, FC_ITEM, makeStorageItem,
    makeStorageItemComplete, AUCTION_START_TIME, CONTENT
} = require("./utils");

const makeStorageItemComplete2 = ({auctionEndTime, lastFillUpTime}) => {
    return [
        "uint256", '38930916800118655128984401856443062677799436388671332167772672007419684920584', // index,
        "Address", '0:' + COLLECTION_ADDRESS, // collection_address
        "Address", '0:' + OWNER_ADDRESS, // owner_address
        'cell', CONTENT,
        'cell', [ // domain
            'string', 'alice',
        ],
        'uint1', 0, // auction maybe
        'uint64', lastFillUpTime || AUCTION_START_TIME // last_fill_up_time
    ];
}

funcer({'logVmOps': false, 'logFiftCode': false}, {
    'path': './func/',
    'fc': FC_ITEM,
    'data': makeStorageItemComplete2({}),
    'in_msgs': [
        {
            "time": AUCTION_START_TIME + 1,
            "sender": '0:' + OWNER_ADDRESS,
            "amount": 1000 * TON,
            "body": [],
            "new_data": makeStorageItemComplete2({
                lastFillUpTime: AUCTION_START_TIME + 1
            }),
            "out_msgs": []
        },
    ],
    "get_methods": [
        {
            "name": "dnsresolve",
            "args": [
                ['bytes', new TextEncoder().encode('\0')],
                ['int', '0x82a3537ff0dbce7eec35d69edc3a189ee6f17d82f353a553f9aa96cb0be3ce89']
            ],
            "output": [
                ["int", 8],
                ['cell', [
                    'uint8', 0,
                    'string', 'alice.ton'
                ]]
            ]
        },
        // {
        //     "name": "dnsresolve",
        //     "args": [
        //         ['bytes', new TextEncoder().encode('\0subdomain\0')],
        //         ['int', '0x82a3537ff0dbce7eec35d69edc3a189ee6f17d82f353a553f9aa96cb0be3ce89']
        //     ],
        //     "output": [
        //         ["int", 8],
        //         ['null', 'null']
        //     ]
        // },
    ]
});

