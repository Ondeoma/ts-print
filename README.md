# ts-print
This is a simple Source Transformer that prints the AST to files instead of transforming the code.
It is designed for use with [ts-patch](https://github.com/nonara/ts-patch).

This tool is primarily intended for debugging purposes, allowing you to inspect the AST structure.

## Usage
```json
{
  "compilerOptions": {
    "plugins": [
      {
        "transform": "@ondeoma/ts-print",
        "inputDir": "src",
        "outputDir": "printed"
      }
    ]
  }
}
```
See `packages/example` for complete example.

## Notes
- `inputDir`: This option is used to determine the relative path structure for the output files. The transformer does not read files directly from this directory (it processes files handled by the compiler).

- `--noEmit`: This transformer does not work with the --noEmit option, as Source Transformers run during the emit phase. Related issue: [ts-patch#178](https://github.com/nonara/ts-patch/issues/178).
