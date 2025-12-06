import { useState, useEffect, useCallback } from "react";
import { api } from "../../libs/api";

type Meta = {
  titulo: string;
  tipo: "Peso" | "Percentual de gordura";
  objetivo: number;
  atual: number;
  descricao?: string;
};

export default function MetasCard() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [tipoMeta, setTipoMeta] = useState<Meta["tipo"]>("Peso");
  const [objetivo, setObjetivo] = useState<number>(0);
  const [atual, setAtual] = useState<number>(0);
  const [descricao, setDescricao] = useState<string>("");
  // Para edição
  const [editIdx, setEditIdx] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    const me = await api.auth.me();
    const dados = await api.metas.listar(me.email);
    const user = await api.users.get(me.email);
    const adaptadas = dados.map(m => {
      let atual = 0;
      let tipo: "Peso" | "Percentual de gordura";

      if (m.tipo === "P") {
        tipo = "Peso";
        atual = user.peso || 0;
      } else {
        tipo = "Percentual de gordura";
        atual = (user.percentual_gordura || 0) * 100;
      }

      return {
        titulo: m.titulo,
        tipo,
        objetivo: m.objetivo,
        atual, 
        descricao: m.descricao || undefined,
      } as Meta;
    });

    setMetas(adaptadas);
  }, []);

  useEffect(() => {
    carregar();
    
    const handler = () => {
      carregar();
    };
    window.addEventListener("userMetricsUpdated", handler);
    return () => {
      window.removeEventListener("userMetricsUpdated", handler);
    };
  }, [carregar]);

  async function handleAddMeta() {
  try {
    const teste = await api.auth.me();
    const email = teste.email;
    if (!email) {
      console.error("Nenhum email no localStorage");
      return;
    }

    let descricaoMeta = "";
    const tipoBanco = tipoMeta === "Peso" ? "P" : "G";

    const payload = {
      usuarioEmail: email,
      titulo: tipoMeta, 
      descricao: descricaoMeta,
      valorMeta: objetivo,
      tipoMeta: tipoBanco,
    };

    console.log("DEBUG enviar payload /metas/criar:", payload);
    const resp = await api.metas.criar(payload);
    console.log("DEBUG resposta /metas/criar:", resp);

    const novas = await api.metas.listar(email);
    const me = await api.auth.me();
    const user = await api.users.get(me.email);

    const adaptadas = novas.map((m: any) => {
      let atual = 0;
      let tipo: "Peso" | "Percentual de gordura";
      if (m.tipo === "P") {
        tipo = "Peso";
        atual = user.peso || 0;
      } else {
        tipo = "Percentual de gordura";
        atual = (user.percentual_gordura || 0) * 100;
      }
      return {
        tipo,
        objetivo: m.objetivo,
        atual,
        descricao: m.descricao || undefined,
      } as Meta;
    });

    setMetas(adaptadas);
    fecharModal();
  } catch (err) {
    console.error("Erro ao criar meta:", err);
    alert("Erro ao criar meta, veja o console para detalhes");
  }
}

  async function handleEditMeta() {
    if (editIdx === null) return;
    const meta = metas[editIdx];
    if(!meta) return;
    try{
      const me = await api.auth.me();
      const payload = {
        usuarioEmail: me.email,
        titulo: meta.tipo,
        descricao: descricao || "",
        valorMeta: objetivo,
        tipoMeta: meta.tipo === "Peso" ? "P" : "G",
      };
      await api.metas.editar(payload);
      await carregar();
      fecharModal();
    } catch(err) {
      console.error("Erro ao editar meta:", err);
      alert("Erro ao editar meta");
    }
  }

  async function handleDeleteMeta() {
    if (editIdx === null) return;
    const meta = metas[editIdx];
    if(!meta) return;
    try{
      const me = await api.auth.me();
      await api.metas.excluir({usuarioEmail: me.email, titulo: meta.titulo});
      await carregar();
      fecharModal();
    } catch(err) {
      console.error("Erro ao excluir meta:", err);
      alert("Erro ao excluir meta");
    }
  }

  function abrirModalEdicao(idx: number) {
    const meta = metas[idx];
    setEditIdx(idx);
    setTipoMeta(meta.tipo);
    setObjetivo(meta.objetivo);
    setAtual(meta.atual);
    setShowModal(true);
  }

  function fecharModal() {
    setShowModal(false);
    setTipoMeta("Peso");
    setObjetivo(0);
    setAtual(0);
    setEditIdx(null);
  }

  return (
    <div className="p-4">
      <div className="bg-white shadow-md rounded-xl p-6 gap-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-10 h-10 fill-current"><path d="M448 256a192 192 0 1 0 -384 0 192 192 0 1 0 384 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zm256 80a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm0-224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zM224 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg>
          </div>
          <h2 className="text-xl font-bold">Metas</h2>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            onClick={() => setShowModal(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 fill-current">
            <path d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z"/></svg>
          </button>
        </div>
        <ul className="space-y-3">
          {metas.map((meta, idx) => {
            const menor = meta.atual < meta.objetivo;
            let progresso = Math.min((meta.atual / meta.objetivo) * 100, 100);
            if (menor) {
              progresso;
            } else {
              progresso = Math.min((meta.objetivo / meta.atual) * 100, 100);
            }
            return (
              <li key={idx} className="p-3 bg-gray-50 border rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">
                    {meta.tipo}
                  </span>
                  <span className="text-sm text-gray-600">
                    {meta.atual} / {meta.objetivo}{" "}
                    {meta.tipo === "Peso"
                      ? "kg"
                      : meta.tipo === "Percentual de gordura"
                      ? "%"
                      : "kg"}
                  </span>
                  <button
                    className="ml-2 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                    onClick={() => abrirModalEdicao(idx)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 640"
                      className="w-5 h-5 fill-current"
                    >
                      <path d="M535.6 85.7C513.7 63.8 478.3 63.8 456.4 85.7L432 110.1L529.9 208L554.3 183.6C576.2 161.7 576.2 126.3 554.3 104.4L535.6 85.7zM236.4 305.7C230.3 311.8 225.6 319.3 222.9 327.6L193.3 416.4C190.4 425 192.7 434.5 199.1 441C205.5 447.5 215 449.7 223.7 446.8L312.5 417.2C320.7 414.5 328.2 409.8 334.4 403.7L496 241.9L398.1 144L236.4 305.7zM160 128C107 128 64 171 64 224L64 480C64 533 107 576 160 576L416 576C469 576 512 533 512 480L512 384C512 366.3 497.7 352 480 352C462.3 352 448 366.3 448 384L448 480C448 497.7 433.7 512 416 512L160 512C142.3 512 128 497.7 128 480L128 224C128 206.3 142.3 192 160 192L256 192C273.7 192 288 177.7 288 160C288 142.3 273.7 128 256 128L160 128z" />
                    </svg>
                  </button>
                </div>
                <div className="w-full bg-gray-200 rounded h-3 mt-2">
                  <div
                    className="bg-blue-500 h-3 rounded"
                    style={{ width: `${progresso}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600">
                  {Math.round(progresso)}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Modal de adicionar/editar meta */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 bg-opacity-30 flex items-center justify-center z-50 ">
          <div className="bg-white rounded-xl shadow-lg p-6 min-w-[320px]">
            <h3 className="text-lg font-bold mb-4">
              {editIdx === null ? "Adicionar Meta" : "Editar Meta"}
            </h3>
            <div className="mb-3">
              <label className="block mb-1 font-semibold">Tipo de Meta</label>
              <select
                className="border rounded px-2 py-1 w-full"
                value={tipoMeta}
                onChange={(e) => setTipoMeta(e.target.value as Meta["tipo"])}
                disabled={editIdx !== null} // Não permite trocar tipo ao editar
              >
                <option value="Peso">Peso</option>
                <option value="Percentual de gordura">
                  Percentual de gordura
                </option>
              </select>
            </div>
            {tipoMeta === "Peso" && (
              <div className="mb-3">
                <label className="block mb-1 font-semibold">
                  Peso desejado (kg)
                </label>
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-full"
                  value={objetivo}
                  onChange={(e) => setObjetivo(Number(e.target.value))}
                  min={0}
                />
              </div>
            )}
            {tipoMeta === "Percentual de gordura" && (
              <div className="mb-3">
                <label className="block mb-1 font-semibold">
                  Percentual desejado (%)
                </label>
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-full"
                  value={objetivo}
                  onChange={(e) => setObjetivo(Number(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={fecharModal}
              >
                Cancelar
              </button>
              {editIdx !== null && (
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
                  onClick={() => {
                    handleDeleteMeta();
                    fecharModal();
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current" viewBox="0 0 640 512">
                    <path d="M136.7 5.9C141.1-7.2 153.3-16 167.1-16l113.9 0c13.8 0 26 8.8 30.4 21.9L320 32 416 32c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 8.7-26.1zM32 144l384 0 0 304c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-304zm88 64c-13.3 0-24 10.7-24 24l0 192c0 13.3 10.7 24 24 24s24-10.7 24-24l0-192c0-13.3-10.7-24-24-24zm104 0c-13.3 0-24 10.7-24 24l0 192c0 13.3 10.7 24 24 24s24-10.7 24-24l0-192c0-13.3-10.7-24-24-24zm104 0c-13.3 0-24 10.7-24 24l0 192c0 13.3 10.7 24 24 24s24-10.7 24-24l0-192c0-13.3-10.7-24-24-24z"/></svg>
                  Excluir
                </button>
              )}
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={editIdx === null ? handleAddMeta : handleEditMeta}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}