Protobuf-ES: Writing Plugins
========================
Code generator plugins can be created using the npm packages [@bufbuild/protoplugin](https://npmjs.com/package/@bufbuild/protoplugin) and [@bufbuild/protobuf](https://npmjs.com/package/@bufbuild/protobuf). This is a detailed overview of the process of writing a plugin.

- [Introduction](#introduction)
- [Writing a plugin](#writing-a-plugin)
  - [Installing the plugin framework and dependencies](#installing-the-plugin-framework-and-dependencies)
  - [Setting up your plugin](#setting-up-your-plugin)
  - [Providing generator functions](#providing-generator-functions)
     - [Overriding transpilation](#overriding-transpilation) 
  - [Generating a file](#generating-a-file)
  - [Walking through the schema](#walking-through-the-schema)
  - [Printing to a generated file](#printing-to-a-generated-file)
     - [As a variadic function](#as-a-variadic-function)
     - [As a template literal tagged function](#as-a-template-literal-tagged-function)   
  - [Importing](#importing)
     - [Importing from an NPM package](#importing-from-an-npm-package) 
     - [Importing from `protoc-gen-es` generated code](#importing-from-protoc-gen-es-generated-code) 
     - [Importing from the `@bufbuild/protobuf` runtime](#importing-from-the-bufbuildprotobuf-runtime)
     - [Type-only imports](#type-only-imports)
     - [Why use `f.import()`?](#why-use-fimport)
  - [Exporting](#exporting)
  - [Parsing plugin options](#parsing-plugin-options)
  - [Using custom Protobuf options](#using-custom-protobuf-options)
- [Testing](#testing)
- [Examples](#examples)

## Introduction

Code generator plugins are a unique feature of protocol buffer compilers like protoc and the [buf CLI](https://docs.buf.build/introduction#the-buf-cli).  With a plugin, you can generate files based on Protobuf schemas as the input.  Outputs such as RPC clients and server stubs, mappings from protobuf to SQL, validation code, and pretty much anything else you can think of can all be produced.

The contract between the protobuf compiler and a code generator plugin is defined in [plugin.proto](https://github.com/protocolbuffers/protobuf/blob/main/src/google/protobuf/compiler/plugin.proto). Plugins are simple executables (typically on your `$PATH`) that are named `protoc-gen-x`, where `x` is the name of the language or feature that the plugin provides. The protobuf compiler parses the protobuf files, and invokes the plugin, sending a `CodeGeneratorRequest` on standard in, and expecting a `CodeGeneratorResponse` on standard out. The request contains a set of descriptors (see [descriptor.proto](https://github.com/protocolbuffers/protobuf/blob/main/src/google/protobuf/descriptor.proto)) - an abstract version of the parsed protobuf files. The response contains a list of files, each having a name and text content.

For more information on how plugins work, check out [our documentation](https://docs.buf.build/reference/images). 

## Writing a plugin

The following will describe the steps and things to know when writing your own code generator plugin.  The main step in the process is passing a plugin initialization object to the `createEcmaScriptPlugin` function exported by the plugin framework.  This plugin initalization object will contain various properties pertaining to different aspects of your plugin.

### Installing the plugin framework and dependencies

The main dependencies for writing plugins are the main plugin package at [@bufbuild/protoplugin](https://npmjs.com/package/@bufbuild/protoplugin) and the runtime API at [@bufbuild/protobuf](https://npmjs.com/package/@bufbuild/protobuf).  Using your package manager of choice, install the above packages:

**npm**
```bash
npm install @bufbuild/protoplugin @bufbuild/protobuf
```

**pnpm**
```bash
pnpm install @bufbuild/protoplugin @bufbuild/protobuf
```

**Yarn**
```bash
yarn add @bufbuild/protoplugin @bufbuild/protobuf
```

### Setting up your plugin

The first thing to determine for your plugin is the `name` and `version`.  These are both passed as properties on the plugin initialization object.  

The `name` property denotes the name of your plugin.  Most plugins are prefixed with `protoc-gen` as required by `protoc` i.e. [protoc-gen-es](https://github.com/bufbuild/protobuf-es/tree/main/packages/protoc-gen-es).

The `version` property is the semantic version number of your plugin.  Typically, this should mirror the version specified in your package.json.

The above values will be placed into the preamble of generated code, which provides an easy way to determine the plugin and version that was used to generate a specific file.

For example, with a `name` of **protoc-gen-foo** and `version` of **v0.1.0**, the following will be added to generated files:

```ts
 // @generated by protoc-gen-foo v0.1.0 with parameter "target=ts"
 ```


### Providing generator functions

Generator functions are functions that are used to generate the actual file content parsed from protobuf files.  There are three that can be implemented, corresponding to the three possible target outputs for plugins:

| Target Out | Function |
| :--- | :--- |
| `ts` | `generateTs(schema: Schema): void` |
| `js` | `generateJs(schema: Schema): void` |
| `dts` | `generateDts(schema: Schema): void` |

Of the three, only `generateTs` is required.  These functions will be passed as part of your plugin initialization and as the plugin runs, the framework will invoke the functions depending on which target outputs were specified by the plugin consumer.  

Since `generateJs` and `generateDts` are both optional, if they are not provided, the plugin framework will attempt to transpile your generated TypeScript files to generate any desired `js` or `dts` outputs if necessary.

In most cases, implementing the `generateTs` function only and letting the plugin framework transpile any additionally required files should be sufficient.  However, the transpilation process is somewhat expensive and if plugin performance is a concern, then it is recommended to implement `generateJs` and `generateDts` functions also as the generation processing is much faster than transpilation.

#### Overriding transpilation

As mentioned, if you do not provide a `generateJs` and/or a `generateDts` function and either `js` or `dts` is specified as a target out, the plugin framework will use its own TypeScript compiler to generate these files for you.  This process uses a stable version of TypeScript with lenient compiler options so that files are generated under most conditions.  However, if this is not sufficient, you also have the option of providing your own `transpile` function, which can be used to override the plugin framework's transpilation process.  

```ts
transpile(
  fileInfo: FileInfo[], 
  transpileJs: boolean, 
  transpileDts: boolean,
  jsImportStyle: "module" | "legacy_commonjs",
): FileInfo[]
```

The function will be invoked with an array of `FileInfo` objects representing the TypeScript file content
to use for transpilation as well as two booleans indicating whether the function should transpile JavaScript,
declaration files, or both.  It should return a list of `FileInfo` objects representing the transpiled content.

**NOTE**:  The `transpile` function is meant to be used in place of either `generateJs`, `generateDts`, or both.  
However, those functions will take precedence.  This means that if `generateJs`, `generateDts`, and 
`transpile` are all provided, `transpile` will be ignored.

A sample invocation of `createEcmaScriptPlugin` after the above steps will look similar to:

```ts
export const protocGenFoo = createEcmaScriptPlugin({
   name: "protoc-gen-foo",
   version: "v0.1.0",
   generateTs,
});
```

### Generating a file

As illustrated above, the generator functions are invoked by the plugin framework with a parameter of type `Schema`.  This object contains the information needed to generate code.  In addition to the [`CodeGeneratorRequest`](https://github.com/protocolbuffers/protobuf/blob/main/src/google/protobuf/compiler/plugin.proto) that is standard when working with protoc plugins, the `Schema` object also contains some convenience interfaces that make it a bit easier to work with the various descriptor objects.  See [Walking through the schema](#walking-through-the-schema) for more information on the structure. 

For example, the `Schema` object contains a `files` property, which is a list of `DescFile` objects representing the files requested to be generated.  The first thing you will most likely do in your generator function is iterate over this list and issue a call to a function that is also present on the `Schema` object: `generateFile`.  This function expects a filename and returns a generated file object containing a `print` function which you can then use to "print" to the file.  For more information, see [Printing to a generated file](#printing-to-a-generated-file) below. 

Each `file` object on the schema contains a `name` property representing the name of the file that was parsed by the compiler (minus the `.proto` extension).  When specifying the filename to pass to `generateFile`, it is recommended to use this file name plus the name of your plugin (minus `protoc-gen`).  So, for example, for a file named `user_service.proto` being processed by `protoc-gen-foo`,  the value passed to `generateFile` would be `user_service_foo.ts`.

A more detailed example:

```ts
function generateTs(schema: Schema) {
   for (const file of schema.files) {
     const f = schema.generateFile(file.name + "_foo.ts");
     ...
   }
}
```


### Walking through the schema

The `Schema` object contains the hierarchy of the grammar contained within a Protobuf file.  The plugin framework uses its own interfaces that mostly correspond to the `DescriptorProto` objects representing the various elements of Protobuf (messages, enums, services, methods, etc.).  Each of the framework interfaces is prefixed with `Desc`, i.e. `DescMessage`, `DescEnum`, `DescService`, `DescMethod`.

The hierarchy starts with `DescFile`, which contains all the nested `Desc` types necessary to begin generating code.  For example:

```ts
for (const file of schema.files) {
  // file is type DescFile
  
  for (const enumeration of file.enums) {
     // enumeration is type DescEnum
  }
  
  for (const message of file.messages) {
     // message is type DescMessage
  }
     
  for (const service of file.services) {
     // service is type DescService
     
     for (const method of service.methods) {
         // method is type DescMethod
     }
  }
}
```

### Printing to a generated file
 
As mentioned, the object returned from `generateFile` contains a `print` function which can be used to print your generated code to a file.  The `print` function is an overloaded function which can be used in one of two ways:

#### As a variadic function

The first way is as a variadic function which accepts zero-to-many string arguments.  These values will then be "printed" to the file so that when the actual physical file is generated by the compiler, all values given to `print` will be included in the file.  Successive strings passed in the same invocation will be appended to one another.  To print an empty line, pass zero arguments to `print`.
 
For example:

```ts
const name = "UserService";
f.print("export class ", name, "Client {");     
f.print("    console.log('Hello world');");
f.print("}");
```

The above will generate:

```ts
export class UserServiceClient {
    console.log('Hello world');
}
```

#### As a template literal tagged function

You can also pass a template literal to the function and use string interpolation as you would do in regular JavaScript:

For example:

```ts
const name = "UserService";
f.print`export class ${name}Client {`;   
f.print`    console.log('Hello world');`;
f.print`}`;
```

The above will generate:

```ts
export class UserServiceClient {
    console.log('Hello world');
}
```

Putting all of the above together for a simple example:
  
  ```ts
function generateTs(schema: Schema) {
   for (const file of schema.files) {
  
     for (const enumeration of file.enums) {
        f.print`// generating enums from ${file.name}`;
        f.print();
        ...
     }
  
     for (const message of file.messages) {
        f.print`// generating messages from ${file.name}`;
        f.print();
        ...
     }
     
     for (const service of file.services) {
        f.print`// generating services from ${file.name}`;
        f.print();
        for (const method of service.methods) {
            f.print`// generating methods for service ${service.name}`;
            f.print();
            ...
        }
     }
   }
}
```

**NOTE**:  Messages can be recursive structures, containing other message and enum definitions.  The example above does not illustrate generating _all_ possible messages in a `Schema` object.  It has been simplified for brevity.

### Importing

Generating import statements is accomplished via a combination of the methods `import` and `print` on the generated file 
object. 

#### Importing from an NPM package

To import from an NPM package, you first invoke the `import` function, passing the name of the symbol to import, and the 
package in which it is located. For example, to import the `useEffect` hook from React:

```ts
const useEffect = f.import("useEffect", "react");
```

This will return you an object of type `ImportSymbol`.  This object can then be used in your generation code with the `print` function:

```ts
f.print(useEffect, "(() => {");
f.print("    document.title = `You clicked ${count} times`;
f.print("});");
```

When the `ImportSymbol` is printed (and only when it is printed), an import statement will be automatically generated for you:

`import { useEffect } from 'react';`

#### Importing from `protoc-gen-es` generated code 

To import a message or enumeration from `protoc-gen-es` generated code, you can simply pass the descriptor to `import()`:

```ts
declare var someMessageDescriptor: DescMessage;
const someMessage = f.import(someMessageDescriptor);
f.print('const msg = new ', someMessage,'();');
```

There is also a shortcut in `print` which does the above for you:

```ts
f.print('const msg = new ', someMessageDescriptor,'();');
```

#### Importing from the @bufbuild/protobuf runtime

The `Schema` object contains a `runtime` property which provides an `ImportSymbol` for all important types as a convenience:

```ts
const { JsonValue } = schema.runtime;
f.print('const j: ', JsonValue, ' = "hello";');
```

#### Type-only imports

If you would like the printing of your `ImportSymbol` to generate a type-only import, then you can convert it using the `toTypeOnly()` function:

```ts
const { Message } = schema.runtime;
const MessageAsType = Message.toTypeOnly();
f.print("isFoo<T extends ", MessageAsType, "<T>>(data: T): bool {");
f.print("   return true;");
f.print("}");
```

This will instead generate the following import:

```ts
import type { Message } from "@bufbuild/protobuf";
```

This is useful when `importsNotUsedAsValues` is set to `error` in your tsconfig, which will not allow you to use a plain import if that import is never used as a value.  

Note that some of the `ImportSymbol` types in the schema runtime (such as `JsonValue`) are type-only imports by default since they cannot be used as a value.  Most, though, can be used as both and will default to a regular import.

#### Why use `f.import()`?

The natural instinct would be to simply print your own import statements as `f.print("import { Foo } from 'bar'")`, but this is not the recommended approach.  Using `f.import()` has many advantages such as:

- **Conditional imports**: Import statements belong at the top of a file, but you usually only find out later whether you need the import, such as further in your code in a nested if statement.  Conditionally printing the import symbol will only generate the import statement when it is actually used.
   
- **Preventing name collisions**: For example if you `import { Foo } from "bar"`  and `import { Foo } from "baz"` , `f.import()` will automatically rename one of them `Foo$1`, preventing name collisions in your import statements and code.

- **Import styles**: If the plugin option `js_import_style=legacy_commonjs` is set, code is automatically generated
  with `require()` calls instead of `import` statements.
  

### Exporting

To export a declaration from your code, use `exportDecl`:

```typescript
const name = "foo";
f.exportDecl("const", name);
```

This method takes two arguments:
1. The declaration, for example `const`, `enum`, `abstract class`, or anything 
   you might need.
2. The name of the declaration, which is also used for the export.

The return value of the method can be passed to `print`: 

```typescript
const name = "foo";
f.print(f.exportDecl("const", name), " = 123;");
```

The example above will generate the following code:

```typescript
export const foo = 123;
```

If the plugin option `js_import_style=legacy_commonjs` is set, the example will
automatically generate the correct export for CommonJS.


### Parsing plugin options

The plugin framework recognizes a set of pre-defined key/value pairs that can be passed to all plugins when executed (i.e. `target`, `keep_empty_files`, etc.), but if your plugin needs to be passed additional parameters, you can specify a `parseOption` function as part of your plugin initialization.  

```ts
parseOption(key: string, value: string | undefined): void;
```

This function will be invoked by the framework, passing in any key/value pairs that it does not recognize from its pre-defined list.

### Using custom Protobuf options

Your plugin can support custom Protobuf options to modify the code it generates. 

As an example, let's use a custom service option to provide a default host. 
Here is how this option would be used:

```protobuf
syntax = "proto3";
import "customoptions/default_host.proto";
package connectrpc.eliza.v1;

service MyService {

  // Set the default host for this service with our custom option.
  option (customoptions.default_host) = "https://demo.connectrpc.com/";

  // ...
}
```

Custom options are extensions to one of the options messages defined in 
`google/protobuf/descriptor.proto`. Here is how we can define the option we are 
using above:

```protobuf
// customoptions/default_host.proto
syntax = "proto3";
import "google/protobuf/descriptor.proto";
package customoptions;

extend google.protobuf.ServiceOptions {
  // We extend the ServiceOptions message, so that other proto files can import
  // this file, and set the option on a service declaration.
  optional string default_host = 1001;
}
```

You can learn more about custom options in the [language guide](https://protobuf.dev/programming-guides/proto3/#customoptions).

First, we need to generate code for our custom option. This will generate a file
`customoptions/default_host_pb.ts` with a new export - our extension:

```ts
import { ServiceOptions, Extension } from "@bufbuild/protobuf";

export const default_host: Extension<ServiceOptions, string> = ...
```

Now we can utilize this extension to read custom options in our plugin:

```ts
import type { GeneratedFile } from "@bufbuild/protoplugin/ecmascript";
import { ServiceOptions, ServiceDesc, hasExtension, getExtension } from "@bufbuild/protobuf";
import { default_host } from "./customoptions/default_host_pb.js";

function generateService(desc: ServiceDesc, f: GeneratedFile) {
    // The protobuf message google.protobuf.ServiceOptions contains our custom
    // option. 
    const serviceOptions: ServiceOptions | undefined = service.proto.options;
    
    // Let's see if our option was set:
    if (serviceOptions && hasExtension(serviceOption, default_host)) {
      const value = getExtension(serviceOption, default_host); // "https://demo.connectrpc.com/"
      // Our option was set, we can use it here.
    }
}
```

Custom options can be set on any Protobuf element. They can be simple singular 
string fields as the one above, but also repeated fields, message fields, etc.

Take a look at our [plugin example](https://github.com/bufbuild/protobuf-es/tree/main/packages/protoplugin-example)
to see the custom option above in action, and run the code yourself.


## Testing

We recommend to test generated code just like handwritten code. Identify a 
representative protobuf file for your use case, generate code, and then simply
run tests against the generated code.

If you implement your own generator functions for the `js` and `dts` targets,
we recommend to run all tests against both.


## Examples

For a small example of generating a Twirp client based on a simple service definition, take a look at [protoplugin-example](https://github.com/bufbuild/protobuf-es/tree/main/packages/protoplugin-example).

Additionally, check out [protoc-gen-es](https://github.com/bufbuild/protobuf-es/tree/main/packages/protoc-gen-es), which is the official code generator for Protobuf-ES.
