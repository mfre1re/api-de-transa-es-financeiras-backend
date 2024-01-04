create database dindin;

create table usuarios (
  id serial primary key,
  nome text not null,
  email text unique,
  senha text
);

create table categorias (
  id serial primary key,
  descricao text
);

create table transacoes (
  id serial primary key,
  descricao text,
  valor integer,
  data timestamp,
  categoria_id integer references categorias(id),
  usuario_id integer references usuarios(id),
  tipo text
);

insert into categorias (descricao) values 
('Alimentação'), ('Assinaturas e serviços'), ('Casa'), ('Mercado'), ('Cuidados pessoais'), ('Educação'),
  ('Família'), ('Lazer'), ('Pets'), ('Presentes'), ('Roupas'), ('Saúde'), ('Transporte'), ('Salário'), ('Vendas'),
  ('Outras receitas'), ('Outras despesas');

