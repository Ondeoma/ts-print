import { describe, expect, test } from "vitest";
import ts from "typescript";
import path from "path";

function loadConfig(projectRoot: string): ts.ParsedCommandLine {
  const configPath = path.join(projectRoot, "tsconfig.json");

  const configFileText = ts.sys.readFile(configPath);
  if (!configFileText) {
    throw new Error(`tsconfig.json not found at ${configPath}`);
  }
  const { config } = ts.parseConfigFileTextToJson(configPath, configFileText);

  const parsedConfig = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    projectRoot,
    undefined,
    configPath,
  );
  return parsedConfig;
}

function createProgramForDirectory(
  projectRoot: string,
  targetDir: string,
): ts.Program {
  const parsedConfig = loadConfig(projectRoot);

  const targetPath = path.join(projectRoot, targetDir);
  const targetFileNames = ts.sys.readDirectory(
    targetPath,
    [".ts"],
    undefined,
    undefined,
    undefined,
  );

  const host = ts.createCompilerHost(parsedConfig.options);

  const program = ts.createProgram(
    targetFileNames, // instead of parsedConfig.fileNames
    parsedConfig.options,
    host,
  );
  return program;
}

function getSortedSources(
  projectRoot: string,
  targetDir: string,
): readonly ts.SourceFile[] {
  const targetPath = path.join(projectRoot, targetDir);
  const program = createProgramForDirectory(projectRoot, targetDir);
  return program
    .getSourceFiles()
    .filter(
      (file) =>
        !file.isDeclarationFile &&
        path.resolve(file.fileName).includes(targetPath),
    )
    .toSorted((a: ts.SourceFile, b: ts.SourceFile): number => {
      const aName = path.relative(targetPath, a.fileName);
      const bName = path.relative(targetPath, b.fileName);
      return aName === bName ? 0 : aName < bName ? -1 : +1;
    });
}

describe("Printed Source Check", () => {
  test("AST of printed source should be identical to original one.", () => {
    const projectRoot = "../test-target";

    const originalSources = getSortedSources(projectRoot, "src");
    const printedSources = getSortedSources(projectRoot, "transformed");

    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
    });

    originalSources
      .map<[ts.SourceFile, ts.SourceFile]>((value, index) => [
        value,
        printedSources[index]!,
      ])
      .forEach(([orginal, printed]) => {
        expect(printer.printFile(printed)).equals(printer.printFile(orginal));
      });
  });
});
