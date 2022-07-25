const {funcer} = require("./funcer");
const {
    makeStorageItemNonInit, FC_COLLECTION, DNS_NEXT_RESOLVER_PREFIX, AUCTION_START_DURATION,
    TON, COLLECTION_ADDRESS, OWNER_ADDRESS, USER_ADDRESS, YEAR, FC_ITEM, makeStorageItem, AUCTION_START_TIME
} = require("./utils");


const EDITED_CONTENT = [ // content
    'uint8', 0,
    'uint256->cell', { // content
        '0x82a3537ff0dbce7eec35d69edc3a189ee6f17d82f353a553f9aa96cb0be3ce89': [
            'cell', [
                'uint8', 0,
                'string', 'EDITED alice.ton'
            ]
        ],
        '0xc9046f7a37ad0ea7cee73355984fa5428982f8b37c8f7bcec91f7ac71a7cd104': [
            'cell', [
                'uint8', 0,
                'string', 'EDITED TON Domain'
            ]
        ],
        '0x6105d6cc76af400325e94d588ce511be5bfdbb73b437dc51eca43917d7a43e3d': [
            'cell', [
                'uint8', 0,
                'string', 'EDITED https://dns.ton.org/icon.png#alice',
            ]
        ]
    },
];

const makeStorageItem2 = ({auctionEndTime}) => {
    return [
        "uint256", '38930916800118655128984401856443062677799436388671332167772672007419684920584', // index,
        "Address", '0:' + COLLECTION_ADDRESS, // collection_address
        "Address", '0:' + OWNER_ADDRESS, // owner_address
        'cell', EDITED_CONTENT,
        'cell', [ // domain
            'string', 'alice',
        ],
        'uint1', 0, // auction maybe
        'uint64', AUCTION_START_TIME + 1 // last_fill_up_time
    ];
}

funcer({'logVmOps': false, 'logFiftCode': false}, {
    'path': './func/',
    'fc': FC_ITEM,
    'data': makeStorageItem({auctionEndTime: AUCTION_START_TIME}),
    'in_msgs': [
        {
            "time": AUCTION_START_TIME + 1,
            "sender": '0:' + OWNER_ADDRESS,
            "contract_balance": 1000 * TON,
            "amount": 1 * TON,
            "body": [
                'uint32', 0x1a0b9d51,
                'uint64', 1,
                'cell', EDITED_CONTENT
            ],
            "new_data": makeStorageItem2({}),
            "out_msgs": [
                {
                    "type": "Internal",
                    "to": "0:" + COLLECTION_ADDRESS,
                    "amount": 998 * TON,
                    "sendMode": 2,
                    "body": [
                        "uint32", 7, // op
                        "uint64", 0, // query_id
                    ],
                }
            ]
        },
        {
            "time": AUCTION_START_TIME + 1,
            "sender": '0:' + USER_ADDRESS,
            "contract_balance": 1000 * TON,
            "amount": 1 * TON,
            "body": [
                'uint32', 0x1a0b9d51,
                'uint64', 1,
                'cell', EDITED_CONTENT
            ],
            "exit_code": 410
        },
    ]
});

