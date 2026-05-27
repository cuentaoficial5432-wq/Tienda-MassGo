-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.carrito (
  id_carrito integer NOT NULL DEFAULT nextval('carrito_id_carrito_seq'::regclass),
  id_usuario integer,
  fecha_creacion timestamp without time zone DEFAULT now(),
  CONSTRAINT carrito_pkey PRIMARY KEY (id_carrito),
  CONSTRAINT carrito_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario)
);
CREATE TABLE public.carritodetalle (
  id integer NOT NULL DEFAULT nextval('carritodetalle_id_seq'::regclass),
  id_carrito integer,
  id_producto integer,
  cantidad integer NOT NULL,
  precio numeric NOT NULL,
  CONSTRAINT carritodetalle_pkey PRIMARY KEY (id),
  CONSTRAINT carritodetalle_id_carrito_fkey FOREIGN KEY (id_carrito) REFERENCES public.carrito(id_carrito),
  CONSTRAINT carritodetalle_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto)
);
CREATE TABLE public.categoria (
  id_categoria integer NOT NULL DEFAULT nextval('categoria_id_categoria_seq'::regclass),
  nombre character varying NOT NULL,
  descripcion text,
  CONSTRAINT categoria_pkey PRIMARY KEY (id_categoria)
);
CREATE TABLE public.comprobante (
  id_comprobante integer NOT NULL DEFAULT nextval('comprobante_id_comprobante_seq'::regclass),
  tipo character varying NOT NULL,
  numero character varying NOT NULL UNIQUE,
  fecha timestamp without time zone DEFAULT now(),
  id_pago integer UNIQUE,
  CONSTRAINT comprobante_pkey PRIMARY KEY (id_comprobante),
  CONSTRAINT comprobante_id_pago_fkey FOREIGN KEY (id_pago) REFERENCES public.pago(id_pago)
);
CREATE TABLE public.detallepedido (
  id_detalle integer NOT NULL DEFAULT nextval('detallepedido_id_detalle_seq'::regclass),
  id_pedido integer,
  id_producto integer,
  cantidad integer NOT NULL,
  precio_unitario numeric NOT NULL,
  CONSTRAINT detallepedido_pkey PRIMARY KEY (id_detalle),
  CONSTRAINT detallepedido_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES public.pedido(id_pedido),
  CONSTRAINT detallepedido_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto)
);
CREATE TABLE public.direccion (
  id_direccion integer NOT NULL DEFAULT nextval('direccion_id_direccion_seq'::regclass),
  direccion character varying NOT NULL,
  ciudad character varying,
  referencia character varying,
  id_tipo_direccion integer,
  CONSTRAINT direccion_pkey PRIMARY KEY (id_direccion),
  CONSTRAINT direccion_id_tipo_direccion_fkey FOREIGN KEY (id_tipo_direccion) REFERENCES public.tipodireccion(id_tipo_direccion)
);
CREATE TABLE public.documento (
  id_documento integer NOT NULL DEFAULT nextval('documento_id_documento_seq'::regclass),
  numero character varying NOT NULL UNIQUE,
  id_persona integer,
  id_tipo_doc integer,
  CONSTRAINT documento_pkey PRIMARY KEY (id_documento),
  CONSTRAINT documento_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.persona(id_persona),
  CONSTRAINT documento_id_tipo_doc_fkey FOREIGN KEY (id_tipo_doc) REFERENCES public.tipodocumento(id_tipo_doc)
);
CREATE TABLE public.envio (
  id_envio integer NOT NULL DEFAULT nextval('envio_id_envio_seq'::regclass),
  direccion_entrega character varying NOT NULL,
  estado character varying DEFAULT 'Pendiente'::character varying,
  fecha_envio timestamp without time zone,
  fecha_entrega timestamp without time zone,
  id_pedido integer UNIQUE,
  CONSTRAINT envio_pkey PRIMARY KEY (id_envio),
  CONSTRAINT envio_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES public.pedido(id_pedido)
);
CREATE TABLE public.metodopago (
  id_metodo integer NOT NULL DEFAULT nextval('metodopago_id_metodo_seq'::regclass),
  nombre character varying NOT NULL,
  CONSTRAINT metodopago_pkey PRIMARY KEY (id_metodo)
);
CREATE TABLE public.pago (
  id_pago integer NOT NULL DEFAULT nextval('pago_id_pago_seq'::regclass),
  fecha timestamp without time zone DEFAULT now(),
  monto numeric NOT NULL,
  id_pedido integer,
  id_metodo integer,
  CONSTRAINT pago_pkey PRIMARY KEY (id_pago),
  CONSTRAINT pago_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES public.pedido(id_pedido),
  CONSTRAINT pago_id_metodo_fkey FOREIGN KEY (id_metodo) REFERENCES public.metodopago(id_metodo)
);
CREATE TABLE public.pedido (
  id_pedido integer NOT NULL DEFAULT nextval('pedido_id_pedido_seq'::regclass),
  fecha timestamp without time zone DEFAULT now(),
  estado character varying DEFAULT 'Pendiente'::character varying,
  total numeric NOT NULL,
  id_usuario integer,
  CONSTRAINT pedido_pkey PRIMARY KEY (id_pedido),
  CONSTRAINT pedido_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario)
);
CREATE TABLE public.persona (
  id_persona integer NOT NULL DEFAULT nextval('persona_id_persona_seq'::regclass),
  nombres character varying NOT NULL,
  apellidos character varying NOT NULL,
  fecha_nacimiento date,
  CONSTRAINT persona_pkey PRIMARY KEY (id_persona)
);
CREATE TABLE public.personadireccion (
  id integer NOT NULL DEFAULT nextval('personadireccion_id_seq'::regclass),
  id_persona integer,
  id_direccion integer,
  CONSTRAINT personadireccion_pkey PRIMARY KEY (id),
  CONSTRAINT personadireccion_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.persona(id_persona),
  CONSTRAINT personadireccion_id_direccion_fkey FOREIGN KEY (id_direccion) REFERENCES public.direccion(id_direccion)
);
CREATE TABLE public.personatelefono (
  id integer NOT NULL DEFAULT nextval('personatelefono_id_seq'::regclass),
  id_persona integer,
  id_telefono integer,
  CONSTRAINT personatelefono_pkey PRIMARY KEY (id),
  CONSTRAINT personatelefono_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.persona(id_persona),
  CONSTRAINT personatelefono_id_telefono_fkey FOREIGN KEY (id_telefono) REFERENCES public.telefono(id_telefono)
);
CREATE TABLE public.personausuario (
  id integer NOT NULL DEFAULT nextval('personausuario_id_seq'::regclass),
  id_persona integer UNIQUE,
  id_usuario integer UNIQUE,
  CONSTRAINT personausuario_pkey PRIMARY KEY (id),
  CONSTRAINT personausuario_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.persona(id_persona),
  CONSTRAINT personausuario_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario)
);
CREATE TABLE public.producto (
  id_producto integer NOT NULL DEFAULT nextval('producto_id_producto_seq'::regclass),
  nombre character varying NOT NULL,
  descripcion text,
  precio numeric NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  estado character varying DEFAULT 'Disponible'::character varying,
  id_categoria integer,
  es_oferta_flash boolean DEFAULT false,
  imagen_url text,
  CONSTRAINT producto_pkey PRIMARY KEY (id_producto),
  CONSTRAINT producto_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES public.categoria(id_categoria)
);
CREATE TABLE public.rol (
  id_rol integer NOT NULL DEFAULT nextval('rol_id_rol_seq'::regclass),
  nombre character varying NOT NULL UNIQUE,
  CONSTRAINT rol_pkey PRIMARY KEY (id_rol)
);
CREATE TABLE public.telefono (
  id_telefono integer NOT NULL DEFAULT nextval('telefono_id_telefono_seq'::regclass),
  numero character varying NOT NULL,
  id_tipo_tel integer,
  CONSTRAINT telefono_pkey PRIMARY KEY (id_telefono),
  CONSTRAINT telefono_id_tipo_tel_fkey FOREIGN KEY (id_tipo_tel) REFERENCES public.tipotelefono(id_tipo_tel)
);
CREATE TABLE public.tipodireccion (
  id_tipo_direccion integer NOT NULL DEFAULT nextval('tipodireccion_id_tipo_direccion_seq'::regclass),
  nombre character varying NOT NULL,
  CONSTRAINT tipodireccion_pkey PRIMARY KEY (id_tipo_direccion)
);
CREATE TABLE public.tipodocumento (
  id_tipo_doc integer NOT NULL DEFAULT nextval('tipodocumento_id_tipo_doc_seq'::regclass),
  nombre character varying NOT NULL,
  descripcion character varying,
  CONSTRAINT tipodocumento_pkey PRIMARY KEY (id_tipo_doc)
);
CREATE TABLE public.tipotelefono (
  id_tipo_tel integer NOT NULL DEFAULT nextval('tipotelefono_id_tipo_tel_seq'::regclass),
  nombre character varying NOT NULL,
  CONSTRAINT tipotelefono_pkey PRIMARY KEY (id_tipo_tel)
);
CREATE TABLE public.usuario (
  id_usuario integer NOT NULL DEFAULT nextval('usuario_id_usuario_seq'::regclass),
  username character varying NOT NULL UNIQUE,
  email character varying NOT NULL UNIQUE,
  password character varying NOT NULL,
  estado character varying DEFAULT 'Activo'::character varying,
  fecha_registro timestamp without time zone DEFAULT now(),
  CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario)
);
CREATE TABLE public.usuariorol (
  id integer NOT NULL DEFAULT nextval('usuariorol_id_seq'::regclass),
  id_usuario integer,
  id_rol integer,
  CONSTRAINT usuariorol_pkey PRIMARY KEY (id),
  CONSTRAINT usuariorol_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario),
  CONSTRAINT usuariorol_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.rol(id_rol)
);