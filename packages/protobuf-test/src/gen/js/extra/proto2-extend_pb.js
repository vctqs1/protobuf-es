// Copyright 2021-2022 Buf Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// @generated by protoc-gen-es v0.1.1 with parameter "ts_nocheck=false,target=js+dts"
// @generated from file extra/proto2-extend.proto (package spec, syntax proto2)
/* eslint-disable */

import {proto2} from "@bufbuild/protobuf";

/**
 * @generated from message spec.Proto2Extendee
 */
export const Proto2Extendee = proto2.makeMessageType(
  "spec.Proto2Extendee",
  () => [
    { no: 1, name: "foo", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
  ],
);
