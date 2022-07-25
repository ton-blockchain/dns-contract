const {funcer} = require("./funcer");
const {
    makeStorageCollection, FC_COLLECTION, DNS_NEXT_RESOLVER_PREFIX,
    TON, CONFIG_PARAMS, COLLECTION_ADDRESS, OWNER_ADDRESS, USER_ADDRESS
} = require("./utils");

const storage = () => {
    return makeStorageCollection({});
}

funcer({'logVmOps': false, 'logFiftCode': false}, {
    'path': './func/',
    'fc': FC_COLLECTION,
    "configParams": CONFIG_PARAMS,
    'data': storage(),
    'in_msgs': [
        {
            "sender": '0:' + COLLECTION_ADDRESS,
            "amount": 10 * TON,
            "body": [],
            // "new_data": storage,
            "exit_code": 0xffff
        },
        {
            "sender": '0:' + COLLECTION_ADDRESS,
            "amount": 10 * TON,
            "body": [
                'uint32', 1
            ],
            // "new_data": storage,
            "exit_code": 0xffff
        },
        {
            "sender": '0:' + COLLECTION_ADDRESS,
            "amount": 10 * TON,
            "body": [
                'uint32', 7
            ],
            "new_data": storage(),
            "exit_code": 0
        },
    ],
    "get_methods": [
        {
            "name": "get_nft_content",
            "args": [
                ["cell", [ // content
                    'uint8', 1,
                    'string', 'https://ton.org/collection.json'
                ]],
            ],
            "output": [
                ["cell", [ // content
                    'uint8', 1,
                    'string', 'https://ton.org/collection.json'
                ]],
            ]
        },
        {
            "name": "get_collection_data",
            "args": [
            ],
            "output": [
                ["int", 0],
                ["cell", [ // content
                    'uint8', 1,
                    'string', 'https://ton.org/collection.json'
                ]],
                ["null", "null"]
            ]
        },
        // {
        //     "name": "get_nft_address_by_index",
        //     "args": [
        //         ["int", 1]
        //     ],
        //     "output": [
        //         ["hashu", '63510023014831555397400702175474279292479092682101742919664604181945239950513'],
        //     ]
        // },
        {
            "name": "dnsresolve",
            "args": [
                ['bytes', new TextEncoder().encode('\0')],
                ['int', '0']
            ],
            "output": [
                ["int", 8],
                ["null", 'null']
            ]
        },
        {
            "name": "dnsresolve",
            "args": [
                ['bytes', new TextEncoder().encode('alice\0')],
                ['int', '0']
            ],
            "output": [
                ["int", 5 * 8],
                ["hashu", '63510023014831555397400702175474279292479092682101742919664604181945239950513']
            ]
        },
        {
            "name": "dnsresolve",
            "args": [
                ['bytes', new TextEncoder().encode('alice\0sub\0')],
                ['int', '0']
            ],
            "output": [
                ["int", 5 * 8],
                ["hashu", '63510023014831555397400702175474279292479092682101742919664604181945239950513']
            ]
        },
        {
            "name": "dnsresolve",
            "args": [
                ['bytes', new TextEncoder().encode('\0alice\0')],
                ['int', '0']
            ],
            "output": [
                ["int", 6 * 8],
                ["hashu", '63510023014831555397400702175474279292479092682101742919664604181945239950513']
            ]
        },
    ],
});