import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

export interface Options {
  inputDir: string,
  outputDir: string,
}

const entry = (_program: ts.Program, options: Options, ): ts.TransformerFactory<ts.SourceFile> => {
  console.log("printing AST...")
  console.log(`options: ${JSON.stringify(options)}`)

  const inputDir = path.resolve(options.inputDir)
  const outputDir = path.resolve(options.outputDir)

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
  });

  const printSource = (source: ts.SourceFile) => {
    const to = path.resolve(outputDir, path.relative(inputDir, path.resolve(source.fileName)))
    // console.log(`Printing transformed ${source.fileName} to ${to}`)

    const toDir = path.dirname(to)
    if (!fs.existsSync(toDir)) {
       fs.mkdirSync(toDir, { recursive: true });
    }

    const content = printer.printFile(source);
    fs.writeFileSync(to, content, "utf8");
  }
  const factory = (_context: ts.TransformationContext) => (source: ts.SourceFile) => {
    printSource(source)
    return source
  }

  return factory
}

export default entry;
