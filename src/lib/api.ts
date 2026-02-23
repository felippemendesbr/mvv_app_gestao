export interface AuthHeaders {
  tipoUsuario: string;
  rede: string;
}

/**
 * Lê os headers de autenticação de uma Request (API routes).
 */
export function getAuthFromRequest(request: Request): AuthHeaders | null {
  const tipo = request.headers.get("x-user-tipo");
  const rede = request.headers.get("x-user-rede");
  if (!tipo) return null;
  return {
    tipoUsuario: tipo,
    rede: rede ?? "",
  };
}

export function isAdmin(tipo: string): boolean {
  return /administrador/i.test(tipo);
}

export function isPastor(tipo: string): boolean {
  return /pastor/i.test(tipo);
}

export function needsRedeFilter(tipo: string): boolean {
  return /pastor/i.test(tipo) || /membro/i.test(tipo);
}

export function canWrite(tipo: string): boolean {
  return !/pastor/i.test(tipo);
}

/**
 * Fetch com headers de autenticação (tipo e rede do usuário logado).
 * Usado nas chamadas que precisam filtrar por perfil/rede.
 */
export function authFetch(
  url: string | URL,
  options: RequestInit = {}
): Promise<Response> {
  if (typeof window === "undefined") {
    return fetch(url, options);
  }
  try {
    const raw = localStorage.getItem("usuario");
    const usuario = raw ? (JSON.parse(raw) as { tipoUsuario?: string; rede?: string }) : null;
    const headers = new Headers(options.headers);
    if (usuario) {
      headers.set("X-User-Tipo", usuario.tipoUsuario ?? "");
      headers.set("X-User-Rede", usuario.rede ?? "");
    }
    return fetch(url, { ...options, headers });
  } catch {
    return fetch(url, options);
  }
}

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("usuario");
    const usuario = raw ? (JSON.parse(raw) as { tipoUsuario?: string; rede?: string }) : null;
    if (!usuario) return {};
    return {
      "X-User-Tipo": usuario.tipoUsuario ?? "",
      "X-User-Rede": usuario.rede ?? "",
    };
  } catch {
    return {};
  }
}
