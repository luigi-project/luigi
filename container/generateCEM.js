const fs = require('fs');
const path = require('path');
const { parse, AST_TOKEN_TYPES } = require('@typescript-eslint/typescript-estree');

const luigiContainerPath = 'src/LuigiContainer.svelte';
const luigiCompoundContainerPath = 'src/LuigiCompoundContainer.svelte';
const luigiContainerTypingsPath = 'typings/LuigiContainer.svelte.d.ts';
const luigiCompoundContainerTypingsPath = 'typings/LuigiCompoundContainer.svelte.d.ts';
const luigiEventsPath = 'typings/constants/events.d.ts';

/**
 * Parses a `props` object from the provided file content string.
 * @param {string} fileContent - The content of the file as a string, which should contain a `props` object.
 * @returns {Object} The parsed `props` object.
 */
function parseContainerProps(fileContent) {
  if (!fileContent || fileContent === '') {
    throw new Error('Cannot parse container props, fileContent is empty in parseContainerProps.');
  }
  const propsIndex = fileContent.indexOf('props:');
  if (propsIndex === -1) {
    throw new Error('No properties found.');
  }

  let openBraces = 0;
  let propsStart = fileContent.indexOf('{', propsIndex);
  let propsEnd = propsStart;

  for (let i = propsStart; i < fileContent.length; i++) {
    if (fileContent[i] === '{') {
      openBraces++;
    } else if (fileContent[i] === '}') {
      openBraces--;
    }

    if (openBraces === 0) {
      propsEnd = i;
      break;
    }
  }

  const propsObjectString = fileContent.slice(propsStart, propsEnd + 1);
  const propsObject = eval(`(${propsObjectString})`);

  return propsObject;
}

function findAttachedJSDocComment(declaration, previousDeclaration, comments) {
  const candidates = comments.filter((comment) => {
    return (
      comment.loc.end.line < declaration.loc.start.line &&
      (!previousDeclaration || comment.loc.start.line > previousDeclaration.loc.end.line)
    );
  });

  return candidates?.length > 0 ? candidates[candidates.length - 1] : undefined;
}

/**
 * Parses a JavaScript file content to extract custom events and their descriptions from JSDoc comments.
 *
 * @param {string} fileContent - The content of a JavaScript file as a string, expected to contain event declarations with JSDoc comments.
 * @returns {Array<Object>} An array of event objects.
 *
 * This function creates an Abstract Syntax Tree (AST) from the file content and iterates through export declarations to locate event definitions.
 * For each event with a literal type, the function extracts the name and associated JSDoc comment, cleans the comment, and stores both in the returned array.
 */
function parseContainerEvents(fileContent) {
  if (!fileContent || fileContent === '') {
    throw new Error('Cannot parse events in parseContainerEvents');
  }
  const options = {
    loc: true,
    range: true,
    tokens: true,
    comment: true
  };

  const ast = parse(fileContent, options);

  const events = [];
  const jsdocComments = ast.comments.filter((comment) => {
    return comment.type === AST_TOKEN_TYPES.Block && comment.value.startsWith('*');
  });

  ast.body.forEach((stmt) => {
    if (stmt.type === 'ExportNamedDeclaration' && stmt.declaration?.declarations?.length) {
      let previousDeclaration;
      stmt.declaration.declarations.forEach((declaration) => {
        if (
          declaration.type === 'VariableDeclarator'
          && declaration.init.type === 'Literal'
        ) {
          const name = declaration.init.value;
          const jsdocComment = findAttachedJSDocComment(declaration, previousDeclaration, jsdocComments);
          if (jsdocComment?.value) {
            let cleanedComment = jsdocComment.value
              .trim()
              .split('\n')
              .map((line) => {
                if (line.trim().startsWith('*')) {
                  return line.trim().slice(1).trim();
                }
                return line.trim();
              })
              .join(' ')
              .replace('=> -', '-')
              .replace('unspecified -', '-')
              .replace('@param', '@type')
              .replace('@returns {void}', '')
              .replaceAll('<br>', '')
              .trim();

            if (cleanedComment && cleanedComment.indexOf('@deprecated') > 0) {
              console.log('IGNORING', name, ': marked as deprecated');
            } else {
              events.push({
                name,
                description: cleanedComment || 'No description'
              });
            }
          }
        }

        previousDeclaration = declaration;
      });
    }
  });
  // Keep it for debugging purpose
  // const outputPath = path.join(__dirname, 'eventsAst.json');
  // fs.writeFile(outputPath, JSON.stringify(ast, null, 2), (writeErr) => {
  //     if (writeErr) {
  //         console.error('Error to write JSON-file:', writeErr);
  //         return;
  //     }
  //     console.log('Created file successfully!');
  // });
  return events;
}

/**
 * Generates an array of module objects based on the provided container definitions.
 *
 * @param {Array<Object>} containers - An array of container objects, each containing properties
 * needed to generate a module structure.
 * @returns {Array<Object>} An array of module objects.
 */
function generateModules(containers) {
  if (!containers || !containers.length) {
    throw new Error('Cannot create modules for cem in generateModules');
  }
  const modules = [];
  containers.forEach((container) => {
    let module = {
      kind: 'javascript-module',
      path: container.modulePath,
      declarations: [
        {
          kind: 'class',
          description: container.containerName,
          name: container.containerName,
          tagName: container.tagName,
          customElement: true,
          members: generateMembers(container.containerMembers, container.containerFields),
          events: generateEvents(container.containerEvents)
        }
      ],
      exports: [
        {
          kind: 'js',
          name: container.containerName,
          declaration: {
            name: container.containerName,
            module: container.module
          }
        },
        {
          kind: 'custom-element-definition',
          name: container.tagName,
          declaration: {
            name: container.containerName,
            module: container.module
          }
        }
      ]
    };
    modules.push(module);
  });
  return modules;
}

/**
 * Generates the custom element manifest file
 * @param {Array} containers meta data for luigi container and luigi compound container
 * @returns a custom element manifest
 */
function generateCEM(containers) {
  const modules = generateModules(containers);
  if (!modules && !modules.length) {
    throw new Error('Cannot create modules for cem in generateCEM.');
  } else {
    return {
      schemaVersion: '2.1.0',
      readme: '',
      modules
    };
  }
}

/**
 * Generates an array of member objects based on provided properties and methods.
 *
 * @param {Object} props - An object representing properties of the members, where each key is a property name
 * and each value is an object describing the property's type.
 * @param {Array<string>} methods - An array of method names for the members.
 *
 * @returns {Array<Object>} An array of member objects, where each object represents either a field or a method.
 */
function generateMembers(props, methods) {
  if (!props || !methods) {
    throw new Error('Props or methods in generateMembers are undefined');
  }
  const members = [];
  for (let key in props) {
    let member = {
      kind: 'field',
      name: key,
      type: generateMemberType(key, props[key]),
      default: 'undefined'
    };
    members.push(member);
  }
  methods.forEach((methodName) => {
    members.push({
      kind: 'method',
      name: methodName
    });
  });
  return members;
}

/**
 * Generates a member type object based on the provided key and value.
 *
 * @param {string} key - The name of the member.
 * @param {Object} value - An object representing the member's details, typically containing a `type` property.
 * @param {string} value.type - The type of the member, which can be `Array`, `String`, `Object`, `Boolean`, or other types.
 *
 * @returns {Object} A member type object.
 */
function generateMemberType(key, value) {
  if (!key || !value) {
    throw new Error('Cannont create member object in generateMemberType');
  }
  if (value.type === 'Array') {
    return {
      text: 'Array<string>'
    };
  } else if (value.type === 'String' || value.type === 'Object' || value.type === 'Boolean') {
    if (key === 'context' || key === 'webcomponent') {
      return { text: 'any' };
    } else {
      return {
        text: String(value.type).toLowerCase()
      };
    }
  } else {
    return {
      text: value.type
    };
  }
}

/**
 * Generates an array of event objects based on the provided `events` input.
 * @param {Object} events - An object containing event definitions, where each key is an event name,
 * and each value is an object with `name` and `description` properties.
 * @param {string} events[].name - The name of the event.
 * @param {string} events[].description - A description of the event.
 * @returns {Array<Object>} An array of event objects.
 */
function generateEvents(events) {
  if (!events || !events.length) {
    throw new Error('No events in generateEvents');
  }
  const eventsArray = [];
  events.forEach((event) => {
    let ev = {
      name: event.name,
      description: event.description,
      type: { text: 'Event' }
    };
    eventsArray.push(ev);
  });
  return eventsArray;
}

/**
 * Parses a JavaScript file content and extracts method names from it.
 *
 * @param {string} fileContent - The content of the JavaScript file as a string, which should define one or more classes or objects.
 * @returns {Array<string>} An array of method names found within the file content.
 *
 * This function utilizes a parsed Abstract Syntax Tree (AST) from the file content to identify method definitions.
 * It iterates through the AST and collects the names of all methods defined in class bodies.
 */
function parseContainerMethods(fileContent) {
  if (!fileContent || fileContent === '') {
    throw new Error('No fileContent in parseContainerMethods');
  }
  const ast = parse(fileContent);
  const methods = [];

  ast.body.forEach((stmt) => {
    stmt.declaration.body.body.forEach((property) => {
      if (property.type === 'MethodDefinition') {
        methods.push(property.key.name);
      }
    });
  });

  // Keep it for debugging purpose
  //   const fileName = ast.body[1].declaration.id.name;
  //   const outputPath = path.join(__dirname, fileName+'_typingsAst.json');
  //   fs.writeFile(outputPath, JSON.stringify(ast, null, 2), (writeErr) => {
  //       if (writeErr) {
  //           console.error('Error to write JSON-file:', writeErr);
  //           return;
  //       }
  //       console.log('Created file successfully!');
  //   });

  return methods;
}

/**
 * Writes the custom element manifest to a file.
 * @param {Object} cem custom element manifest file in json format
 */
function writeFile(cem) {
  if (!cem || Object.keys(cem).length === 0) {
    throw new Error('CEM is empty. Cannot write file.');
  }
  const outputPath = path.join(__dirname, 'public/dist/custom-elements.json');
  fs.writeFile(outputPath, JSON.stringify(cem, null, 2), (writeErr) => {
    if (writeErr) {
      console.error('Error to write JSON-file:', writeErr);
      return;
    }
    console.log('Created file successfully!');
  });
}

function main() {
  const getFileContent = (filePath) => fs.readFileSync(path.join(__dirname, filePath), 'utf-8');
  try {
    const luigiContainerFileContent = getFileContent(luigiContainerPath);
    const luigiCompoundContainerFileContent = getFileContent(luigiCompoundContainerPath);
    const luigiContainerTypingsContent = getFileContent(luigiContainerTypingsPath);
    const luigiCompoundContainerTypingsContent = getFileContent(luigiCompoundContainerTypingsPath);
    const eventsFileContent = getFileContent(luigiEventsPath);

    const events = parseContainerEvents(eventsFileContent);
    const containersMetaData = [
      {
        containerName: 'LuigiContainer',
        module: 'LuigiContainer.js',
        tagName: 'luigi-container',
        modulePath: 'dist/bundle.js',
        containerMembers: parseContainerProps(luigiContainerFileContent),
        containerEvents: events,
        containerFields: parseContainerMethods(luigiContainerTypingsContent)
      },
      {
        containerName: 'LuigiCompoundContainer',
        module: 'LuigiCompoundContainer.js',
        tagName: 'luigi-compound-container',
        modulePath: 'dist/bundle.js',
        containerMembers: parseContainerProps(luigiCompoundContainerFileContent),
        containerEvents: events,
        containerFields: parseContainerMethods(luigiCompoundContainerTypingsContent)
      }
    ];

    const cem = generateCEM(containersMetaData);

    writeFile(cem);
  } catch (error) {
    console.error('Error: ', error.message);
  }
}

main();
