'use strict';

const process = (function () {
    class Token {
        constructor(value, type) {
            this.value = value;
            this.type = type;
        }
    }
    class TreeNode {
        constructor(value, type, left = null, right = null) {
            this.value = value;
            this.type = type;
            this.left = left;
            this.right = right;
        }
    }

    function shuntingYard (infix) {
        let ops = { '+': 1, '-': 1, '*': 2, '/': 2 };
        let peek = (a) => a[a.length - 1];
        let stack = [];
        return infix
            .split('')
            .reduce((output, token) => {
                if (parseFloat(token)) {
                    output.push(new Token(token, 'number'));
                }
                if (token in ops) {
                    while (peek(stack) in ops && ops[token] <= ops[peek(stack)])
                        output.push(new Token(stack.pop(), 'operator'));
                    stack.push(token);
                }
                if (token == '(') {
                    stack.push(token);
                }

                if (token == ')') {
                    while (peek(stack) != '(')
                        output.push(new Token(stack.pop(), 'operator'));
                    stack.pop();
                }

                return output;
            }, [])
            .concat(stack.reverse().map(token => new Token(token, 'operator')));
    }

    const buildTree = function (tokens) {
        const stack = [];

        while (tokens.length) {
            const t = tokens.shift();

            if (t.type == 'number') {
                stack.push(new TreeNode(t.value, t.type));
            } else if (t.type == 'operator') {
                if (stack.length < 2) return "Invalid postfix expression.";

                const right = stack.pop();
                const left = stack.pop();

                stack.push(new TreeNode(t.value, t.type, left, right));
            }
        }

        return stack;
    };

    return code => {
        const sy = shuntingYard(code);
        const tree = buildTree(sy);
        return tree[0];
    };
})();

function getNodeStructure(node) {
    if (node == null) return node;

    let children;

    if (node.left && node.right) {
        children = [
            getNodeStructure(node.left),
            getNodeStructure(node.right)
        ]
    }

    return {
        text: { name: String(node.value) },
        HTMLclass: node.type === 'operator' ? 'op' : 'num',
        children: children
    }
}

let graph = null;

document.getElementById('code_input').addEventListener('change', e => {
    const code = e.target.value;

    const tree = process(code);
    const nodeStructure = getNodeStructure(tree);

    if (graph) graph.destroy();

    graph = new Treant({
        chart: {
            container: "#tree-simple",
            connectors: {
                type: 'straight'
            },
            siblingSeparation: 50
        },
        nodeStructure
    });
});