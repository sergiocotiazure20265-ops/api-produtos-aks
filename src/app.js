const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Banco de dados em memória
let produtos = [
  {
    id: 1,
    nome: 'Notebook Dell',
    preco: 4500
  },
  {
    id: 2,
    nome: 'Mouse Logitech',
    preco: 150
  }
];

let proximoId = 3;

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Produtos',
      version: '1.0.0',
      description: 'API Node.js publicada no Azure AKS'
    },
    servers: [
      { url: '/' }
    ],
    components: {
      schemas: {
        ProdutoInput: {
          type: 'object',
          required: ['nome', 'preco'],
          properties: {
            nome: { type: 'string', example: 'Teclado Gamer' },
            preco: { type: 'number', example: 250 }
          }
        },
        Produto: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nome: { type: 'string', example: 'Teclado Gamer' },
            preco: { type: 'number', example: 250 }
          }
        }
      }
    },
    paths: {
      '/api/produtos': {
        get: {
          summary: 'Listar produtos',
          responses: {
            200: {
              description: 'Lista de produtos',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Produto' }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Cadastrar produto',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ProdutoInput'
                }
              }
            }
          },
          responses: {
            201: { description: 'Produto cadastrado' },
            400: { description: 'Dados inválidos' }
          }
        }
      },
      '/api/produtos/{id}': {
        get: {
          summary: 'Consultar produto por ID',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }],
          responses: {
            200: { description: 'Produto encontrado' },
            404: { description: 'Produto não encontrado' }
          }
        },
        delete: {
          summary: 'Excluir produto',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }],
          responses: {
            204: { description: 'Produto excluído' },
            404: { description: 'Produto não encontrado' }
          }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/swagger', swaggerUi.serve,
  swaggerUi.setup(swaggerSpec));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    aplicacao: 'api-produtos-aks'
  });
});

// Listar produtos
app.get('/api/produtos', (req, res) => {
  res.json(produtos);
});

// Consultar produto
app.get('/api/produtos/:id', (req, res) => {
  const id = Number(req.params.id);

  const produto = produtos.find(p => p.id === id);

  if (!produto) {
    return res.status(404).json({
      mensagem: 'Produto não encontrado.'
    });
  }

  res.json(produto);
});

// Cadastrar produto
app.post('/api/produtos', (req, res) => {
  const { nome, preco } = req.body;

  if (
    typeof nome !== 'string' ||
    nome.trim() === '' ||
    typeof preco !== 'number' ||
    !Number.isFinite(preco) ||
    preco < 0
  ) {
    return res.status(400).json({
      mensagem: 'Informe nome e preço válidos.'
    });
  }

  const produto = {
    id: proximoId++,
    nome: nome.trim(),
    preco
  };

  produtos.push(produto);

  res.status(201).json(produto);
});

// Excluir produto
app.delete('/api/produtos/:id', (req, res) => {
  const id = Number(req.params.id);

  const indice = produtos.findIndex(p => p.id === id);

  if (indice === -1) {
    return res.status(404).json({
      mensagem: 'Produto não encontrado.'
    });
  }

  produtos.splice(indice, 1);

  res.status(204).send();
});

// Inicialização
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API executando na porta ${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/swagger`);
});
