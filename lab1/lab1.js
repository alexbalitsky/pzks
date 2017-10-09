'use strict';

const Operators = ['+', '-', '*', '/', '='];

class TreeNode {
    constructor(type, token, position) {
        this.type = type;
        this.token = token;
        this.position = position;
        this.children = [];
    }
}

function buildAst(code) {
    let position = 0;
    let currentChar = code[0];

    const throwError = (msg) => {
        console.error(msg);
        console.error(code);
        console.error(new Array(position + 1).join(' ') + '^');
        process.exit(1);
    };

    const isDigit = char => !isNaN(char) && char !== null && char !== '' && char !== ' ';
    const isLetter = char => char.toLowerCase() !== char.toUpperCase();
    const isSpace = char => char === ' ';
    const isOperator = char => Operators.indexOf(char) !== -1;

    // move to next character
    const advance = () => {
        if (position >= code.length) throwError('Unexpected end of source code.');
        currentChar = code[++position];
    };

    const skipSpaces = () => {
        while (isSpace(currentChar) && position < code.length) {
            advance();
        }
    };

    const parseNumber = () => {
        let value = "";
        let float = false;

        while (isDigit(currentChar) || currentChar === '.') {
            if (currentChar === '.') {
                if (float) throwError('Wrong float value');
                float = true;
            }

            value += currentChar;
            advance();
        }

        return value;
    };

    const parseString = () => {
        let value = "";

        while (currentChar !== ' ' && typeof currentChar !== "undefined" && currentChar !== ')') {
            if (!isLetter(currentChar)) throwError('Unexpected character');
            value += currentChar;
            advance();
        }

        return value;
    };

    // root node of AST
    let rootNode = new TreeNode('term', null, 0);
    let currentNode = rootNode;
    let nodesStack = [];

    while (position < code.length) {
        if (isSpace(currentChar)) {
            skipSpaces();
            continue;
        }

        if (currentChar === '(') {
            let newTreeNode = new TreeNode('term', null, position);
            currentNode.children.push(newTreeNode);
            nodesStack.push(currentNode);
            currentNode = newTreeNode;
            advance();

            continue;
        }

        if (currentChar === ')') {
            if (nodesStack.length === 0) throwError("Unexpected character");
            advance();
            currentNode = nodesStack.pop();
            continue;
        }

        if (isDigit(currentChar)) {
            const token = Number(parseNumber());
            currentNode.children.push(new TreeNode('number', token, position));
            continue;
        }

        if (isLetter(currentChar)) {
            const token = parseString();
            currentNode.children.push(new TreeNode('string', token, position));
            continue;
        }

        if (isOperator(currentChar)) {
            currentNode.children.push(new TreeNode('operator', currentChar, position));
            advance();
            continue;
        }

        throwError('Unexpected symbol');
    }

    if (nodesStack.length !== 0) throwError('Unexpected end of source code');

    return rootNode;
}

function analyze(ast, code) {
    const throwError = (node, msg) =>
    {
        console.error(msg);
        console.error(code);
        console.error(new Array(node.position + 1).join(' ') + '^');
        process.exit(1);
    };

    const analyzeTermNode = termNode =>
    {
        if (termNode.children.length === 0) {
            throwError(termNode, 'Unexpected empty body');
        }

        if (termNode.children[0].type === 'operator') {
            throwError(termNode, 'Term can\'t start with operator');
        }

        for (let i = 0; i < termNode.children.length; i++) {
            const node = termNode.children[i];
            const nextNode = termNode.children[i + 1];

            if (node.type === 'term') analyzeTermNode(node);

            if (node.type === 'string' || node.type === 'number' || node.type === 'term') {
                if (nextNode && nextNode.type !== 'operator') {
                    throwError(nextNode, 'Unexpected node type ' + nextNode.type);
                }
            }

            if (node.type === 'operator') {
                if (!nextNode) throwError(node, 'Unexpected end of term');
                if (nextNode.type === 'operator') {
                    throwError(nextNode, 'Unexpected operator');
                }
            }
        }
    };


    analyzeTermNode(ast);
}

let code = "1 + ( 2 + sdsds + asd )";
console.log(analyze(buildAst(code), code));