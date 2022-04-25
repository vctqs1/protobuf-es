// Protocol Buffers - Google's data interchange format
// Copyright 2008 Google Inc.  All rights reserved.
// https://developers.google.com/protocol-buffers/
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//     * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above
// copyright notice, this list of conditions and the following disclaimer
// in the documentation and/or other materials provided with the
// distribution.
//     * Neither the name of Google Inc. nor the names of its
// contributors may be used to endorse or promote products derived from
// this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// Author: kenton@google.com (Kenton Varda)
//  Based on original Protocol Buffers design by
//  Sanjay Ghemawat, Jeff Dean, and others.
//
// A proto file which uses optimize_for = CODE_SIZE.

// @generated by protoc-gen-es v0.0.2-alpha.3 with parameter "ts_nocheck=false,target=js+dts"
// @generated from file google/protobuf/unittest_optimize_for.proto (package protobuf_unittest, syntax proto2)
/* eslint-disable */

import type {BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage} from "@bufbuild/protobuf";
import {Message, proto2} from "@bufbuild/protobuf";
import type {ForeignMessage} from "./unittest_pb.js";

/**
 * @generated from message protobuf_unittest.TestOptimizedForSize
 */
export declare class TestOptimizedForSize extends Message<TestOptimizedForSize> {
  /**
   * @generated from field: optional int32 i = 1;
   */
  i?: number;

  /**
   * @generated from field: optional protobuf_unittest.ForeignMessage msg = 19;
   */
  msg?: ForeignMessage;

  /**
   * @generated from oneof protobuf_unittest.TestOptimizedForSize.foo
   */
  foo: {
    /**
     * @generated from field: int32 integer_field = 2;
     */
    value: number;
    case: "integerField";
  } | {
    /**
     * @generated from field: string string_field = 3;
     */
    value: string;
    case: "stringField";
  } | { case: undefined; value?: undefined };

  constructor(data?: PartialMessage<TestOptimizedForSize>);

  static readonly runtime: typeof proto2;
  static readonly typeName = "protobuf_unittest.TestOptimizedForSize";
  static readonly fields: FieldList;

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): TestOptimizedForSize;

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): TestOptimizedForSize;

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): TestOptimizedForSize;

  static equals(a: TestOptimizedForSize | PlainMessage<TestOptimizedForSize> | undefined, b: TestOptimizedForSize | PlainMessage<TestOptimizedForSize> | undefined): boolean;
}

/**
 * @generated from message protobuf_unittest.TestRequiredOptimizedForSize
 */
export declare class TestRequiredOptimizedForSize extends Message<TestRequiredOptimizedForSize> {
  /**
   * @generated from field: required int32 x = 1;
   */
  x: number;

  constructor(data?: PartialMessage<TestRequiredOptimizedForSize>);

  static readonly runtime: typeof proto2;
  static readonly typeName = "protobuf_unittest.TestRequiredOptimizedForSize";
  static readonly fields: FieldList;

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): TestRequiredOptimizedForSize;

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): TestRequiredOptimizedForSize;

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): TestRequiredOptimizedForSize;

  static equals(a: TestRequiredOptimizedForSize | PlainMessage<TestRequiredOptimizedForSize> | undefined, b: TestRequiredOptimizedForSize | PlainMessage<TestRequiredOptimizedForSize> | undefined): boolean;
}

/**
 * @generated from message protobuf_unittest.TestOptionalOptimizedForSize
 */
export declare class TestOptionalOptimizedForSize extends Message<TestOptionalOptimizedForSize> {
  /**
   * @generated from field: optional protobuf_unittest.TestRequiredOptimizedForSize o = 1;
   */
  o?: TestRequiredOptimizedForSize;

  constructor(data?: PartialMessage<TestOptionalOptimizedForSize>);

  static readonly runtime: typeof proto2;
  static readonly typeName = "protobuf_unittest.TestOptionalOptimizedForSize";
  static readonly fields: FieldList;

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): TestOptionalOptimizedForSize;

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): TestOptionalOptimizedForSize;

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): TestOptionalOptimizedForSize;

  static equals(a: TestOptionalOptimizedForSize | PlainMessage<TestOptionalOptimizedForSize> | undefined, b: TestOptionalOptimizedForSize | PlainMessage<TestOptionalOptimizedForSize> | undefined): boolean;
}
