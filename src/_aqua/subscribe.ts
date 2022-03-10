/**
 *
 * This file is auto-generated. Do not edit manually: changes may be erased.
 * Generated by Aqua compiler: https://github.com/fluencelabs/aqua/.
 * If you find any bugs, please write an issue on GitHub: https://github.com/fluencelabs/aqua/issues
 * Aqua version: 0.6.3-282
 *
 */
import { Fluence, FluencePeer } from '@fluencelabs/fluence';
import {
    CallParams,
    callFunction,
    registerService,
} from '@fluencelabs/fluence/dist/internal/compilerSupport/v2';


// Services

export interface SubscriberAPIDef {
    receive_event: (event: string, callParams: CallParams<'event'>) => void | Promise<void>;
}
export function registerSubscriberAPI(serviceId: string, service: SubscriberAPIDef): void;
export function registerSubscriberAPI(peer: FluencePeer, serviceId: string, service: SubscriberAPIDef): void;
       

export function registerSubscriberAPI(...args: any) {
    registerService(
        args,
        {
    "functions" : [
        {
            "functionName" : "receive_event",
            "argDefs" : [
                {
                    "name" : "event",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "void"
            }
        }
    ]
}
    );
}
      
// Functions
 

export function test(
    config?: {ttl?: number}
): Promise<void>;

export function test(
    peer: FluencePeer,
    config?: {ttl?: number}
): Promise<void>;

export function test(...args: any) {

    let script = `
                    (xor
                     (seq
                      (seq
                       (call %init_peer_id% ("getDataSrv" "-relay-") [] -relay-)
                       (call -relay- ("op" "noop") [])
                      )
                      (xor
                       (seq
                        (new $res
                         (xor
                          (seq
                           (seq
                            (seq
                             (call -relay- ("op" "string_to_b58") ["test"] k)
                             (call -relay- ("kad" "neighborhood") [k [] []] nodes)
                            )
                            (par
                             (fold nodes n
                              (par
                               (seq
                                (xor
                                 (xor
                                  (seq
                                   (call n ("peer" "timestamp_sec") [] t)
                                   (call n ("aqua-dht" "get_values") ["test" t] $res)
                                  )
                                  (null)
                                 )
                                 (seq
                                  (call -relay- ("op" "noop") [])
                                  (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 1])
                                 )
                                )
                                (call -relay- ("op" "noop") [])
                               )
                               (next n)
                              )
                             )
                             (null)
                            )
                           )
                           (call -relay- ("aqua-dht" "merge_two") [$res.$.[0].result! $res.$.[1].result!] v)
                          )
                          (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 2])
                         )
                        )
                        (par
                         (fold v.$.result! sub
                          (par
                           (seq
                            (fold sub.$.relay_id! -via-peer-
                             (seq
                              (call -via-peer- ("op" "noop") [])
                              (next -via-peer-)
                             )
                            )
                            (xor
                             (call sub.$.peer_id! (sub.$.service_id.[0]! "receive_event") ["test"])
                             (seq
                              (seq
                               (fold sub.$.relay_id! -via-peer-
                                (seq
                                 (call -via-peer- ("op" "noop") [])
                                 (next -via-peer-)
                                )
                               )
                               (call -relay- ("op" "noop") [])
                              )
                              (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 3])
                             )
                            )
                           )
                           (next sub)
                          )
                         )
                         (null)
                        )
                       )
                       (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 4])
                      )
                     )
                     (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 5])
                    )
    `
    return callFunction(
        args,
        {
    "functionName" : "test",
    "returnType" : {
        "tag" : "void"
    },
    "argDefs" : [
    ],
    "names" : {
        "relay" : "-relay-",
        "getDataSrv" : "getDataSrv",
        "callbackSrv" : "callbackSrv",
        "responseSrv" : "callbackSrv",
        "responseFnName" : "response",
        "errorHandlingSrv" : "errorHandlingSrv",
        "errorFnName" : "error"
    }
},
        script
    )
}

export type Call_subscriberArgSub = { peer_id: string; relay_id: string[]; service_id: string[]; set_by: string; timestamp_created: number; value: string; weight: number; } 

export function call_subscriber(
    sub: Call_subscriberArgSub,
    event: string,
    config?: {ttl?: number}
): Promise<void>;

export function call_subscriber(
    peer: FluencePeer,
    sub: Call_subscriberArgSub,
    event: string,
    config?: {ttl?: number}
): Promise<void>;

export function call_subscriber(...args: any) {

    let script = `
                    (xor
                     (seq
                      (seq
                       (seq
                        (seq
                         (seq
                          (call %init_peer_id% ("getDataSrv" "-relay-") [] -relay-)
                          (call %init_peer_id% ("getDataSrv" "sub") [] sub)
                         )
                         (call %init_peer_id% ("getDataSrv" "event") [] event)
                        )
                        (call -relay- ("op" "noop") [])
                       )
                       (fold sub.$.relay_id! -via-peer-
                        (seq
                         (call -via-peer- ("op" "noop") [])
                         (next -via-peer-)
                        )
                       )
                      )
                      (xor
                       (seq
                        (seq
                         (call sub.$.peer_id! (sub.$.service_id.[0]! "receive_event") [event])
                         (fold sub.$.relay_id! -via-peer-
                          (seq
                           (next -via-peer-)
                           (call -via-peer- ("op" "noop") [])
                          )
                         )
                        )
                        (call -relay- ("op" "noop") [])
                       )
                       (seq
                        (seq
                         (fold sub.$.relay_id! -via-peer-
                          (seq
                           (call -via-peer- ("op" "noop") [])
                           (next -via-peer-)
                          )
                         )
                         (call -relay- ("op" "noop") [])
                        )
                        (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 1])
                       )
                      )
                     )
                     (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 2])
                    )
    `
    return callFunction(
        args,
        {
    "functionName" : "call_subscriber",
    "returnType" : {
        "tag" : "void"
    },
    "argDefs" : [
        {
            "name" : "sub",
            "argType" : {
                "tag" : "primitive"
            }
        },
        {
            "name" : "event",
            "argType" : {
                "tag" : "primitive"
            }
        }
    ],
    "names" : {
        "relay" : "-relay-",
        "getDataSrv" : "getDataSrv",
        "callbackSrv" : "callbackSrv",
        "responseSrv" : "callbackSrv",
        "responseFnName" : "response",
        "errorHandlingSrv" : "errorHandlingSrv",
        "errorFnName" : "error"
    }
},
        script
    )
}

 

export function send_everyone(
    topic: string,
    event: string,
    config?: {ttl?: number}
): Promise<void>;

export function send_everyone(
    peer: FluencePeer,
    topic: string,
    event: string,
    config?: {ttl?: number}
): Promise<void>;

export function send_everyone(...args: any) {

    let script = `
                    (xor
                     (seq
                      (seq
                       (seq
                        (seq
                         (call %init_peer_id% ("getDataSrv" "-relay-") [] -relay-)
                         (call %init_peer_id% ("getDataSrv" "topic") [] topic)
                        )
                        (call %init_peer_id% ("getDataSrv" "event") [] event)
                       )
                       (call -relay- ("op" "noop") [])
                      )
                      (xor
                       (seq
                        (new $res
                         (xor
                          (seq
                           (seq
                            (seq
                             (call -relay- ("op" "string_to_b58") [topic] k)
                             (call -relay- ("kad" "neighborhood") [k [] []] nodes)
                            )
                            (par
                             (fold nodes n
                              (par
                               (seq
                                (xor
                                 (xor
                                  (seq
                                   (call n ("peer" "timestamp_sec") [] t)
                                   (call n ("aqua-dht" "get_values") [topic t] $res)
                                  )
                                  (null)
                                 )
                                 (seq
                                  (call -relay- ("op" "noop") [])
                                  (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 1])
                                 )
                                )
                                (call -relay- ("op" "noop") [])
                               )
                               (next n)
                              )
                             )
                             (null)
                            )
                           )
                           (call -relay- ("aqua-dht" "merge_two") [$res.$.[0].result! $res.$.[1].result!] v)
                          )
                          (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 2])
                         )
                        )
                        (par
                         (fold v.$.result! sub
                          (par
                           (seq
                            (fold sub.$.relay_id! -via-peer-
                             (seq
                              (call -via-peer- ("op" "noop") [])
                              (next -via-peer-)
                             )
                            )
                            (xor
                             (call sub.$.peer_id! (sub.$.service_id.[0]! "receive_event") [event])
                             (seq
                              (seq
                               (fold sub.$.relay_id! -via-peer-
                                (seq
                                 (call -via-peer- ("op" "noop") [])
                                 (next -via-peer-)
                                )
                               )
                               (call -relay- ("op" "noop") [])
                              )
                              (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 3])
                             )
                            )
                           )
                           (next sub)
                          )
                         )
                         (null)
                        )
                       )
                       (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 4])
                      )
                     )
                     (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 5])
                    )
    `
    return callFunction(
        args,
        {
    "functionName" : "send_everyone",
    "returnType" : {
        "tag" : "void"
    },
    "argDefs" : [
        {
            "name" : "topic",
            "argType" : {
                "tag" : "primitive"
            }
        },
        {
            "name" : "event",
            "argType" : {
                "tag" : "primitive"
            }
        }
    ],
    "names" : {
        "relay" : "-relay-",
        "getDataSrv" : "getDataSrv",
        "callbackSrv" : "callbackSrv",
        "responseSrv" : "callbackSrv",
        "responseFnName" : "response",
        "errorHandlingSrv" : "errorHandlingSrv",
        "errorFnName" : "error"
    }
},
        script
    )
}
