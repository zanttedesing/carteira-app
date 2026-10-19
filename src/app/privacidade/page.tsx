import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Política de privacidade" };

export default function PrivacidadePage() {
  return (
    <LegalPage title="Política de privacidade" atualizado="19 de outubro de 2026">
      <p className="mt-4">
        Esta política explica como o <strong>Carteira de Aluguel</strong>, da
        ZantteBR, trata dados pessoais, em linha com a Lei Geral de Proteção de
        Dados (LGPD, Lei 13.709/2018).
      </p>

      <h2>1. Quem é o responsável</h2>
      <p>
        A ZantteBR é a responsável pelos dados da sua conta (nome, e-mail e
        senha). Em relação aos dados de inquilinos, moradores e clientes que
        você cadastra, é você quem decide o que registrar e para quê; nós
        apenas armazenamos e processamos esses dados para o sistema funcionar.
      </p>

      <h2>2. Quais dados tratamos</h2>
      <ul>
        <li>Da sua conta: nome, e-mail, senha (guardada de forma protegida) e tipo de uso.</li>
        <li>
          O que você cadastra: endereços e localização aproximada dos imóveis,
          contratos, valores, nomes e contatos de inquilinos, moradores e
          clientes, pagamentos, reformas e os documentos que você enviar.
        </li>
        <li>Técnicos: cookies de sessão necessários para manter você conectado.</li>
      </ul>

      <h2>3. Para que usamos</h2>
      <ul>
        <li>Criar e manter sua conta e permitir o uso do sistema.</li>
        <li>Calcular pagamentos, comissões e repasses.</li>
        <li>Responder pedidos de ajuda enviados por você.</li>
        <li>Manter a segurança e o bom funcionamento do serviço.</li>
      </ul>
      <p>Não vendemos seus dados nem os usamos para publicidade.</p>

      <h2>4. Com quem compartilhamos</h2>
      <p>
        Usamos prestadores de infraestrutura para operar o sistema: o Supabase
        (banco de dados, autenticação e armazenamento de arquivos) e o Vercel
        (hospedagem do site). Eles tratam os dados apenas para prestar esses
        serviços. Também podemos compartilhar dados se a lei exigir.
      </p>

      <h2>5. Cookies</h2>
      <p>
        Usamos apenas cookies essenciais, que mantêm sua sessão ativa. Não
        usamos cookies de publicidade.
      </p>

      <h2>6. Segurança</h2>
      <p>
        Cada conta só enxerga os próprios dados, e os documentos enviados ficam
        em armazenamento privado. Nenhum sistema é totalmente imune a falhas;
        se houver um incidente que afete seus dados, avisaremos conforme a lei.
      </p>

      <h2>7. Por quanto tempo guardamos</h2>
      <p>
        Mantemos os dados enquanto sua conta existir. Se você pedir a exclusão,
        removemos a conta e os dados cadastrados, salvo o que formos obrigados
        a guardar por lei.
      </p>

      <h2>8. Seus direitos</h2>
      <p>
        Você pode pedir confirmação de que tratamos seus dados, acesso, correção,
        exclusão, portabilidade e informações sobre compartilhamento, entre
        outros direitos previstos na LGPD. Se um inquilino ou morador cadastrado
        por você quiser exercer esses direitos, ele pode falar conosco também.
      </p>

      <h2>9. Contato</h2>
      <p>
        Para exercer seus direitos ou tirar dúvidas:{" "}
        <a className="underline" href="mailto:contato@zantte.com.br">
          contato@zantte.com.br
        </a>
        .
      </p>
    </LegalPage>
  );
}
