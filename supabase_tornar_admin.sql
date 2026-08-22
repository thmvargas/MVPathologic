-- PatoVetZee — torna sua conta admin (rode isso DEPOIS da migração 002)
-- Troque 'seu_apelido_aqui' pelo apelido que você usa pra logar no jogo.

update public.perfis set is_admin = true where apelido = 'seu_apelido_aqui';

-- Prefere localizar pelo e-mail da conta em vez do apelido? Use este lugar:
-- update public.perfis set is_admin = true
--   where id = (select id from auth.users where email = 'seu@email.com');
