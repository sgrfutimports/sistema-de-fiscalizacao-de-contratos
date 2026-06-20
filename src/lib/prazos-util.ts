/**
 * Retorna a data correspondente ao 5º dia útil de um determinado mês e ano.
 * Desconsidera sábados e domingos.
 */
export function getFifthBusinessDay(month: number, year: number): Date {
  let businessDaysCount = 0;
  let date = new Date(year, month - 1, 1);

  // Limite de segurança para evitar loops infinitos
  let attempts = 0;
  while (businessDaysCount < 5 && attempts < 31) {
    const dayOfWeek = date.getDay(); // 0 = Dom, 6 = Sáb
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDaysCount++;
      if (businessDaysCount === 5) {
        const result = new Date(date);
        result.setHours(23, 59, 59, 999);
        return result;
      }
    }
    date.setDate(date.getDate() + 1);
    attempts++;
  }
  return date;
}

/**
 * Verifica se a data atual está dentro do prazo regulamentar para o envio do relatório
 * (entre o 1º dia e o 5º dia útil do mês subsequente à competência).
 * Caso esteja fora do prazo, verifica se há uma exceção ativa no banco de dados.
 */
export function verificarPrazoEnvio(
  competenciaMes: number,
  competenciaAno: number,
  contratoId: string,
  excecoes: Array<{ conteudo: string; autor: string }>
): { valido: boolean; erro?: string } {
  // 1. Calcular o mês subsequente
  let subMes = competenciaMes + 1;
  let subAno = competenciaAno;
  if (subMes > 12) {
    subMes = 1;
    subAno = competenciaAno + 1;
  }

  // Data atual de servidor
  const agora = new Date();

  // Início do prazo: 1º dia do mês subsequente às 00:00:00
  const inicioPrazo = new Date(subAno, subMes - 1, 1, 0, 0, 0, 0);

  // Fim do prazo: 5º dia útil do mês subsequente às 23:59:59
  const fimPrazo = getFifthBusinessDay(subMes, subAno);

  const formatarData = (d: Date) => {
    return d.toLocaleDateString('pt-BR');
  };

  const dentroDoPrazo = agora >= inicioPrazo && agora <= fimPrazo;

  if (dentroDoPrazo) {
    return { valido: true };
  }

  // Caso fora do prazo regulamentar, busca nas exceções homologadas pelo administrador
  // Onde:
  // - exc.conteudo = contratoId (UUID)
  // - exc.autor = "mes/ano" (ex: "6/2026")
  const chaveExcecao = `${competenciaMes}/${competenciaAno}`;
  const temExcecao = (excecoes || []).some(
    (exc) => exc.conteudo === contratoId && exc.autor === chaveExcecao
  );

  if (temExcecao) {
    return { valido: true };
  }

  // Retorna mensagens detalhadas dependendo se o prazo ainda não iniciou ou já encerrou
  if (agora < inicioPrazo) {
    return {
      valido: false,
      erro: `O envio deste relatório está bloqueado. O período regulamentar de envio para a competência ${competenciaMes}/${competenciaAno} iniciará apenas em ${formatarData(inicioPrazo)}.`
    };
  } else {
    return {
      valido: false,
      erro: `O prazo regulamentar para envio deste relatório expirou em ${formatarData(fimPrazo)} (5º dia útil de ${subMes}/${subAno}). O envio só é permitido mediante reabertura de prazo homologada pelo administrador.`
    };
  }
}
