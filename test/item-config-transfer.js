const {funcer} = require("./funcer");
const {
    makeStorageItemNonInit,
    FC_COLLECTION,
    DNS_NEXT_RESOLVER_PREFIX,
    AUCTION_START_DURATION,
    TON,
    CONFIG_PARAMS,
    COLLECTION_ADDRESS,
    OWNER_ADDRESS,
    USER_ADDRESS,
    YEAR,
    FC_ITEM,
    makeStorageItemComplete,
    makeStorageItem
} = require("./utils");

const makeStorageItem2 = ({auctionEndTime}) => {
    return [
        "uint256", '38930916800118655128984401856443062677799436388671332167772672007419684920584', // index,
        "Address", '0:' + COLLECTION_ADDRESS, // collection_address
        "Address", '0:' + USER_ADDRESS, // owner_address
        'cell', [ // content
            'uint8', 0,
            'uint256->cell', { // content
                '0x82a3537ff0dbce7eec35d69edc3a189ee6f17d82f353a553f9aa96cb0be3ce89': [
                    'cell', [
                        'uint8', 0,
                        'string', 'alice.ton'
                    ]
                ],
                '0xc9046f7a37ad0ea7cee73355984fa5428982f8b37c8f7bcec91f7ac71a7cd104': [
                    'cell', [
                        'uint8', 0,
                        'string', 'TON Domain'
                    ]
                ],
                '0x6105d6cc76af400325e94d588ce511be5bfdbb73b437dc51eca43917d7a43e3d': [
                    'cell', [
                        'uint8', 0,
                        'string', 'https://dns.ton.org/icon.png#alice',
                    ]
                ]
            },
        ],
        'cell', [ // domain
            'string', 'alice',
        ],
        'uint1', 0, // auction maybe
        'uint64', 1658151331 // last_fill_up_time
    ];
}

funcer({'logVmOps': false, 'logFiftCode': false}, {
    'path': './func/',
    'fc': FC_ITEM,
    'data': makeStorageItemComplete({}),
    "configParams": {
        80: [
            'cell', [
                "uint256->cell", {
                    '38930916800118655128984401856443062677799436388671332167772672007419684920584': [
                        'uint8', 0,
                        'Address', '0:' + USER_ADDRESS, // new_owner_address
                        'uint2', 0, // response_address
                        'uint1', 0, // custom_payload
                        'coins', 0.5 * TON, // forward_amount
                        'uint1', 0 // forward_payload
                    ]
                }
            ]
        ]
    },
    'in_msgs': [
        {
            "time": 1658151331,
            "sender": '0:' + USER_ADDRESS,
            "contract_balance": 1000 * TON,
            "amount": 1 * TON,
            "body": [
                "uint32", 11,
                "uint64", 123,
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

