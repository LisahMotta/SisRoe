// telas/login.js — entrada no sistema e cadastro de uma escola nova.
import { api, salvarSessao, ultimoCodigo } from '../api.js';
import { $, esc, lerForm, avisar, avisarErro, comCarregando, abrirModal } from '../ui.js';
import { estado, navegar } from '../app.js';

export async function render(el) {
  el.innerHTML = `
    <section class="tela-login">
      <div class="login-marca">
        <span class="marca-icone logo-quadro" aria-hidden="true"></span>
        <h1>SisRoe</h1>
        <p>Registro e acompanhamento de ocorrências escolares para a rede estadual de São Paulo.</p>
        <ul class="login-pontos">
          <li><span data-icone="escudo"></span><span><b>Protocolo 179 — 3ª versão.</b> As 50 situações do DOC Conviva, cada uma com o seu passo a passo.</span></li>
          <li><span data-icone="balanca"></span><span><b>Resolução SEDUC nº 68/2026.</b> Intervenções pedagógicas, níveis de resposta e afastamento preventivo.</span></li>
          <li><span data-icone="cadeado"></span><span><b>Sigilo e LGPD.</b> Cada escola vê apenas os próprios dados, e as ações ficam registradas.</span></li>
        </ul>
      </div>
      <form id="form-login" class="cartao" novalidate>
        <h2>Entrar</h2>
        <p class="sub">Use o código da sua escola e o número do seu RG ou da CIN.</p>
        <label>Código da escola
          <input name="codigo" required autocomplete="organization" autocapitalize="none" value="${esc(ultimoCodigo())}"
                 placeholder="ex.: ee-malba">
        </label>
        <label>Usuário (RG ou CIN)
          <input name="login" required autocomplete="username" autocapitalize="none" placeholder="só os números, ex.: 12345678X">
        </label>
        <label>Senha
          <input name="senha" type="password" required autocomplete="current-password">
        </label>
        <button class="btn btn-primario btn-largo" type="submit">Entrar</button>
        <p class="centro"><button type="button" class="btn-link" id="btn-esqueci" data-icone="chave">Esqueci minha senha</button></p>
        <p class="login-cadastro">Sua escola ainda não usa o SisRoe? <a href="#/cadastro">Cadastre a escola</a></p>
      </form>
    </section>`;

  const form = $('#form-login', el);
  if (form.codigo.value) form.login.focus();
  // Por segurança não há troca de senha por e-mail: quem gera a senha provisória é a equipe gestora.
  $('#btn-esqueci', el).addEventListener('click', () => abrirModal('Esqueci minha senha', `
    <p>Procure a <b>direção</b> ou a <b>coordenação</b> da sua escola (ou o POC).</p>
    <p>Eles geram uma <b>senha provisória</b> para você em poucos segundos. Ao entrar com ela, o sistema pede para você criar
      uma senha nova, só sua.</p>
    <p class="ajuda">Por segurança, o SisRoe não envia senhas por e-mail ou mensagem.</p>
    <div class="acoes"><button class="btn btn-primario" data-fechar>Entendi</button></div>`));
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const d = lerForm(form);
    if (!d.codigo || !d.login || !d.senha) return avisar('Preencha código da escola, usuário e senha.', 'erro');
    await comCarregando(form.querySelector('button'), async () => {
      try {
        const r = await api('/login', { metodo: 'POST', corpo: d });
        salvarSessao({ token: r.token });
        ultimoCodigo(d.codigo.trim().toLowerCase());
        estado.usuario = null; // força recarregar dados da escola
        navegar(r.usuario.trocar_senha ? '#/trocar-senha' : '#/painel');
      } catch (e) { avisarErro(e); }
    });
  });
}

export async function renderCadastro(el) {
  const cfg = await api('/config').catch(() => ({}));
  el.innerHTML = `
    <section class="tela-login tela-cadastro">
      <div class="login-marca">
        <span class="marca-icone logo-quadro" aria-hidden="true"></span>
        <h1>Cadastrar escola</h1>
        <p>Quem faz o cadastro vira o(a) administrador(a) da escola no sistema e depois cadastra os demais servidores.</p>
      </div>
      <form id="form-cadastro" class="cartao" novalidate>
        <fieldset>
          <legend>Dados da escola</legend>
          <label>Nome da escola *
            <input name="nome" required maxlength="150" placeholder="EE Professora …">
          </label>
          <div class="grade-2">
            <label>Código de acesso *
              <input name="codigo" required maxlength="30" autocapitalize="none" placeholder="ex.: ee-malba">
              <small>Usado no login por todos da escola. Só letras minúsculas, números e hífen.</small>
            </label>
            <label>Código CIE
              <input name="cie" maxlength="20" inputmode="numeric">
            </label>
          </div>
          <div class="grade-2">
            <label>Município <input name="municipio" maxlength="80"></label>
            <label>Unidade Regional de Ensino <input name="diretoria" maxlength="120" placeholder="URE …"></label>
          </div>
        </fieldset>
        <fieldset>
          <legend>Seu acesso (administrador)</legend>
          <label>Seu nome completo * <input name="adminNome" required maxlength="120"></label>
          <div class="grade-2">
            <label>Seu cargo
              <select name="perfil"><option value="diretor">Diretor(a)</option><option value="vice">Vice-diretor(a)</option>
                <option value="master">Usuário master (faz a configuração e ajuda a direção)</option></select>
            </label>
            <label>Seu usuário: RG ou CIN * <input name="login" required maxlength="30" autocapitalize="none" autocomplete="username" placeholder="ex.: 12.345.678-X"></label>
          </div>
          <div class="grade-2">
            <label>Senha * <input name="senha" type="password" required autocomplete="new-password"></label>
            <label>Repita a senha * <input name="senha2" type="password" required autocomplete="new-password"></label>
          </div>
          <small>Pelo menos 8 caracteres, com letras e números.</small>
        </fieldset>
        ${cfg.cadastroExigeChave ? `<label>Chave de cadastro *
            <input name="chave" required autocomplete="off"><small>Fornecida por quem administra este servidor.</small></label>` : ''}
        <label class="campo-armadilha" aria-hidden="true">Não preencha este campo <input name="site" tabindex="-1" autocomplete="off"></label>
        <button class="btn btn-primario btn-largo" type="submit">Cadastrar escola</button>
      </form>
      <p class="login-cadastro"><a href="#/login" class="btn-link" data-icone="voltar">Voltar ao login</a></p>
    </section>`;

  const form = $('#form-cadastro', el);
  // Sugere o código a partir do nome, enquanto a pessoa não digitar um.
  let codigoEditado = false;
  form.codigo.addEventListener('input', () => { codigoEditado = true; });
  form.nome.addEventListener('input', () => {
    if (codigoEditado) return;
    form.codigo.value = form.nome.value.normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
  });

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const d = lerForm(form);
    if (d.senha !== d.senha2) return avisar('As senhas não conferem.', 'erro');
    await comCarregando(form.querySelector('button[type=submit]'), async () => {
      try {
        const r = await api('/escolas', { metodo: 'POST', corpo: {
          chave: d.chave,
          site: d.site, // armadilha para robôs (campo invisível)
          escola: { nome: d.nome, codigo: d.codigo, cie: d.cie, municipio: d.municipio, diretoria: d.diretoria },
          admin: { nome: d.adminNome, login: d.login, senha: d.senha, perfil: d.perfil },
        } });
        const l = await api('/login', { metodo: 'POST', corpo: { codigo: r.codigo, login: d.login, senha: d.senha } });
        salvarSessao({ token: l.token });
        ultimoCodigo(r.codigo);
        estado.usuario = null;
        avisar(`Escola cadastrada! Código de acesso: ${r.codigo}`);
        navegar('#/admin/primeiros-passos');
      } catch (e) { avisarErro(e); }
    });
  });
}
