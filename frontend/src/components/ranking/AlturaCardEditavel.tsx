import { useState, useEffect, useRef } from "react";
import { api } from "../../libs/api";

export default function alturaAtualCard() {
  const [editMode, setEditMode] = useState(false);
  const [altura, setAltura] = useState<number | null>(null);
  const originalAlturaRef = useRef<number | null>(null);

  useEffect(() => {
    async function carregarAltura() {
      const me = await api.auth.me();
      const dados = await api.users.get(me.email);
      const valor = dados.altura ?? 0;
      const alturaCm = Math.round(valor * 100);
      setAltura(alturaCm);
      originalAlturaRef.current = alturaCm;
    }
    carregarAltura();
  }, []);

  async function handleSave() {
    if (altura === null) return;
    const me = await api.auth.me();
    const alturaSanitized = Math.round(altura * 100) / 100;
    const valorDecimal = alturaSanitized / 100;
    await api.editar.altura(me.email, valorDecimal);
    originalAlturaRef.current = Math.round(alturaSanitized);
    window.dispatchEvent(new Event("userMetricsUpdated"));
    setEditMode(false);
  }

  function handleCancel() {
    setAltura(originalAlturaRef.current);
    setEditMode(false);
  }

  if (altura === null) return <p>Carregando...</p>;

  return (
    <div className="p-4">
      <div className="bg-white shadow-md rounded-xl p-6 flex items-center gap-4">
        <div className="text-blue-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 640 640"
            className="w-12 h-12"
          >
            <path d="M320 64C185.3 64 64 185.3 64 320s121.3 256 256 256 256-121.3 256-256S454.7 64 320 64zm0 464c-114.9 0-208-93.1-208-208S205.1 112 320 112s208 93.1 208 208-93.1 208-208 208zm0-368c-88.2 0-160 71.8-160 160s71.8 160 160 160 160-71.8 160-160-71.8-160-160-160zm0 288c-70.7 0-128-57.3-128-128s57.3-128 128-128 128 57.3 128 128-57.3 128-128 128z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold whitespace-nowrap">Altura Atual</h2>
          {editMode ? (
            <div className="flex gap-2 items-center">
              <input
                type="number"
                className="border rounded px-2 py-1 w-20 text-xl font-bold"
                value={altura ?? 0}
                onChange={(e) => setAltura(Number(e.target.value))}
                min={0}
              />
              <span className="text-gray-700 text-xl font-bold">cm</span>
              <button
                className="ml-2 px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                onClick={handleSave}
              >
                Salvar
              </button>
              <button
                className="ml-1 px-2 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded text-sm"
                onClick={handleCancel}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <p className="text-gray-700 text-xl font-bold">{altura}cm</p>
          )}
        </div>
        <div className="mt-4 w-full flex justify-end">
          <button
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            onClick={() => {
              setAltura(originalAlturaRef.current);
              setEditMode(true);
            }}
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
      </div>
    </div>
  );
}
