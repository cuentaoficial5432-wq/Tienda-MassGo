async function _lookupOrCreateTipodoc(nombre) {
  const { data: r } = await massgo.from('tipodocumento').select('id_tipo_doc').eq('nombre', nombre).maybeSingle();
  if (r) return r.id_tipo_doc;
  const { data: c } = await massgo.from('tipodocumento').insert({ nombre }).select('id_tipo_doc').single();
  return c.id_tipo_doc;
}

async function _lookupOrCreateTipotel(nombre) {
  const { data: r } = await massgo.from('tipotelefono').select('id_tipo_tel').eq('nombre', nombre).maybeSingle();
  if (r) return r.id_tipo_tel;
  const { data: c } = await massgo.from('tipotelefono').insert({ nombre }).select('id_tipo_tel').single();
  return c.id_tipo_tel;
}

async function _lookupOrCreateRol(nombre) {
  const { data: r } = await massgo.from('rol').select('id_rol').eq('nombre', nombre).maybeSingle();
  if (r) return r.id_rol;
  const { data: c } = await massgo.from('rol').insert({ nombre }).select('id_rol').single();
  return c.id_rol;
}

async function massgoRegister({ email, password, nombres, apellidos, dni, telefono }) {
  const { data: authData, error: authError } = await massgo.auth.signUp({
    email, password,
    options: { data: { nombres, apellidos } },
  });
  if (authError) throw new Error(authError.message);
  if (!authData.session) return { needsEmailConfirmation: true, user: authData.user };

  const userId = authData.user.id;

  const { data: persona, error: pe } = await massgo
    .from('persona').insert({ nombres, apellidos }).select('id_persona').single();
  if (pe) throw new Error('Error al crear persona: ' + pe.message);

  if (dni && dni.trim()) {
    const idTipoDoc = await _lookupOrCreateTipodoc('DNI');
    const { error: de } = await massgo
      .from('documento').insert({ numero: dni.trim(), id_persona: persona.id_persona, id_tipo_doc: idTipoDoc });
    if (de) throw new Error('Error al guardar DNI: ' + de.message);
  }

  if (telefono && telefono.trim()) {
    const idTipoTel = await _lookupOrCreateTipotel('Celular');
    const { data: tel, error: te } = await massgo
      .from('telefono').insert({ numero: telefono.trim(), id_tipo_tel: idTipoTel }).select('id_telefono').single();
    if (te) throw new Error('Error al guardar teléfono: ' + te.message);
    const { error: pte } = await massgo
      .from('personatelefono').insert({ id_persona: persona.id_persona, id_telefono: tel.id_telefono });
    if (pte) throw new Error('Error al vincular teléfono: ' + pte.message);
  }

  const { data: usuario, error: ue } = await massgo
    .from('usuario').insert({ auth_id: userId, username: `${nombres} ${apellidos}`, email, password: '' }).select('id_usuario').single();
  if (ue) throw new Error('Error al crear usuario: ' + ue.message);

  const { error: lke } = await massgo
    .from('personausuario').insert({ id_persona: persona.id_persona, id_usuario: usuario.id_usuario });
  if (lke) throw new Error('Error al vincular persona-usuario: ' + lke.message);

  const idRol = await _lookupOrCreateRol('Cliente');
  const { error: rle } = await massgo
    .from('usuariorol').insert({ id_usuario: usuario.id_usuario, id_rol: idRol });
  if (rle) throw new Error('Error al asignar rol: ' + rle.message);

  return authData;
}

async function massgoLogin({ email, password }) {
  const { data, error } = await massgo.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

async function massgoLogout() {
  const { error } = await massgo.auth.signOut();
  if (error) throw new Error(error.message);
}
