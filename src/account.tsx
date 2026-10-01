import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, Download, Heart, LogOut, MapPin, ShieldAlert, ShoppingBag, Tag, UserRound, WalletCards } from 'lucide-react';
import { api } from './api';
import type { User, Wallet } from './types';

export type AccountSection = 'profile' | 'wallets' | 'activity' | 'interests' | 'offers' | 'downloads' | 'support';

const tabs: { id: AccountSection; label: string; icon: typeof UserRound; href: string }[] = [
  { id: 'profile', label: 'Dados do perfil', icon: UserRound, href: '/profile' },
  { id: 'wallets', label: 'Carteiras', icon: MapPin, href: '/wallets' },
  { id: 'activity', label: 'Atividade', icon: Activity, href: '/profile/activity' },
  { id: 'interests', label: 'Lista de interesse', icon: Heart, href: '/profile/interests' },
  { id: 'offers', label: 'Ofertas', icon: Tag, href: '/profile/offers' },
  { id: 'downloads', label: 'Arquivos baixados', icon: Download, href: '/profile/downloads' },
  { id: 'support', label: 'Suporte', icon: ShieldAlert, href: '/profile/support' },
];

export function Account({ mode, notify }: { mode: AccountSection; notify: (message: string) => void }) {
  const qc = useQueryClient();
  const session = useQuery({ queryKey: ['session'], queryFn: async () => (await api.get<{ user: User | null }>('/session')).data.user });
  const isSignedIn = !!session.data;
  const profile = useQuery({ queryKey: ['profile'], queryFn: async () => (await api.get('/profile')).data, enabled: isSignedIn });
  const wallets = useQuery({ queryKey: ['wallets'], queryFn: async () => (await api.get<Wallet[]>('/wallets')).data, enabled: isSignedIn });
  const favorites = useQuery({ queryKey: ['favorites'], queryFn: async () => (await api.get<string[]>('/favorites')).data, enabled: isSignedIn && mode === 'interests' });
  const [error, setError] = useState('');

  if (!session.data) return <main className="center-state"><h1>Entre para acessar sua conta</h1><a className="button" href="/login">Entrar</a></main>;

  const pageTitle: Record<AccountSection, string> = {
    profile: 'Dados do perfil', wallets: 'Carteiras', activity: 'Atividade', interests: 'Lista de interesse',
    offers: 'Ofertas', downloads: 'Arquivos baixados', support: 'Suporte',
  };

  const saveWallet = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    try {
      await api.post('/wallets', { name: values.get('name'), alias: values.get('alias'), address: values.get('address'), network: values.get('network'), primary: !wallets.data?.length, profile: values.get('profile'), ens: values.get('ens'), type: values.get('type'), referral: values.get('referral'), email: values.get('email'), ensName: values.get('ensName') });
      await qc.invalidateQueries({ queryKey: ['wallets'] });
      form.reset();
      notify('Carteira adicionada');
    } catch {
      setError('Não foi possível cadastrar a carteira. Confira os dados e tente novamente.');
    }
  };

  const signOut = async () => {
    await api.post('/session/logout');
    await qc.clear();
    window.location.href = '/';
  };

  return <main className="account-wrap">
    <aside className="account-nav" aria-label="Navegação da conta">
      <b>Meu perfil</b>
      {tabs.map(({ id, label, icon: Icon, href }) => <a key={id} href={href} className={mode === id ? 'current' : ''} aria-current={mode === id ? 'page' : undefined}><Icon size={14}/>{label}</a>)}
      <button className="account-signout" onClick={signOut}><LogOut size={14}/>Sair</button>
      <div className="account-identity"><img src={session.data.avatar} alt="Avatar do colecionador"/><span>{session.data.name}<small>{session.data.email}</small></span></div>
    </aside>

    <section className="account-form">
      <p className="eyebrow">CONTA DO COLECIONADOR</p>
      <h1>{pageTitle[mode]}</h1>

      {mode === 'profile' && <form className="profile-grid" onSubmit={async event => {
        event.preventDefault(); const values = new FormData(event.currentTarget);
        try { await api.put('/profile', { name: values.get('name'), email: values.get('email'), bio: values.get('bio') }); await qc.invalidateQueries({ queryKey: ['profile'] }); await qc.invalidateQueries({ queryKey: ['session'] }); notify('Perfil atualizado'); }
        catch { setError('Não foi possível salvar o perfil.'); }
      }}>
        <label>Nome completo<input name="name" defaultValue={profile.data?.name || session.data.name} required/></label>
        <label>E-mail<input name="email" type="email" defaultValue={profile.data?.email || session.data.email} required/></label>
        <label>Nome de usuário<input name="handle" defaultValue="@colecionador"/></label>
        <label>País<input defaultValue="Brasil"/></label>
        <label className="span-two">Sobre você<textarea name="bio" rows={3} defaultValue={profile.data?.bio || ''}/></label>
        <div className="span-two avatar-upload"><img src={session.data.avatar} alt="Avatar do colecionador"/><div><b>Foto de perfil</b><small>SVG ou imagem · Até 2MB</small></div><label className="button secondary">Alterar foto<input type="file" accept="image/*" hidden onChange={() => notify('Prévia de avatar atualizada localmente')}/></label></div>
        <h3 className="span-two">Alterar senha</h3><label>Senha atual<input type="password" minLength={6}/></label><label>Nova senha<input type="password" minLength={8}/></label>
        {error && <p className="error-text span-two" role="alert">{error}</p>}<button className="button">Salvar alterações</button>
      </form>}

      {mode === 'wallets' && <div className="wallet-page">
        <div className="wallet-heading"><div><h2>Carteira principal</h2><p>As carteiras ficam disponíveis no pagamento e para receber NFTs comprados.</p></div><a className="text-link" href="#add-wallet">Adicionar</a></div>
        <form id="add-wallet" className="wallet-form wallet-form-grid" onSubmit={saveWallet}>
          <label>Nome de exibição <i>*</i><input name="name" placeholder="Ex.: Minha MetaMask" required/></label>
          <label>Apelido da carteira <i>*</i><input name="alias" placeholder="Ex.: Principal" required/></label>
          <label>Rede <i>*</i><select name="network" defaultValue=""><option value="" disabled>Selecione uma rede</option><option>Ethereum</option><option>Polygon</option><option>Arbitrum</option></select></label>
          <label>Nome do perfil <i>*</i><input name="profile" defaultValue={profile.data?.name || session.data.name} required/></label>
          <label>Endereço da carteira <i>*</i><input name="address" placeholder="Endereço 0x da carteira" pattern="0x[a-fA-F0-9]{6,}" required/></label>
          <label>ENS ou carteira secundária<input name="ens" placeholder="Opcional"/></label>
          <label>Tipo de carteira <i>*</i><select name="type" defaultValue=""><option value="" disabled>Selecione uma carteira</option><option>MetaMask</option><option>WalletConnect</option><option>Outra</option></select></label>
          <label>Código de indicação <i>*</i><input name="referral" placeholder="Código de indicação" required/></label>
          <label>E-mail <i>*</i><input name="email" type="email" defaultValue={session.data.email} required/></label>
          <label>Nome ENS <i>*</i><div className="ens-field"><select aria-label="Extensão ENS"><option>.eth</option></select><input name="ensName" placeholder="Seu nome ENS" required/></div></label>
          {error && <p className="error-text wallet-form-error" role="alert">{error}</p>}
          <button className="button wallet-submit">Salvar carteira</button>
        </form>
        <div className="wallet-secondary-heading"><h2>Carteira secundária</h2><label><input type="checkbox"/> Igual à carteira principal</label><a className="text-link" href="#add-wallet">Adicionar</a></div>
        {wallets.data?.length ? <div className="wallet-list">{wallets.data.map(wallet => <div className="saved-wallet" key={wallet.id}><WalletCards/><span><b>{wallet.name} {wallet.primary && <i>Principal</i>}</b><small>{wallet.address}</small><small>{wallet.network}</small></span><button type="button" className="text-link" onClick={() => notify('Carteira pronta para edição')}>Editar</button></div>)}</div> : <p className="wallet-empty">Você ainda não adicionou uma carteira secundária.</p>}
      </div>}

      {mode === 'interests' && <div className="account-empty"><Heart/><h2>{favorites.data?.length ? 'Suas obras salvas' : 'Sua lista de interesse está vazia'}</h2>{favorites.data?.length ? <p>{favorites.data.length} obra(s) salva(s). Explore o mercado para ver suas peças favoritas.</p> : <p>Salve NFTs com o ícone de coração para encontrá-los aqui.</p>}<a className="button" href="/">Explorar obras</a></div>}
      {['activity', 'offers', 'downloads', 'support'].includes(mode) && <div className="account-empty"><ShoppingBag/><h2>{mode === 'activity' ? 'Nenhuma atividade recente' : mode === 'offers' ? 'Nenhuma oferta disponível' : mode === 'downloads' ? 'Nenhum arquivo baixado' : 'Como podemos ajudar?'}</h2><p>{mode === 'support' ? 'Entre em contato com a equipe Kurio para receber ajuda com sua conta.' : 'Essa área será atualizada quando houver informações disponíveis.'}</p>{mode === 'support' ? <a className="button" href="mailto:suporte@kurio.art">Falar com o suporte</a> : null}</div>}
    </section>
  </main>;
}
