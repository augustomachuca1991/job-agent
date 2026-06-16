import { useState } from "react";

interface Props {
  onConnect: (url: string, key: string) => void;
}

export default function ConfigForm({ onConnect }: Props) {
  const [url, setUrl] = useState(localStorage.getItem("supabase_url") || "");
  const [key, setKey] = useState(localStorage.getItem("supabase_key") || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) return;
    onConnect(url.trim(), key.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-md space-y-5"
      >
        <div>
          <h2 className="text-xl font-semibold">Conectar a Supabase</h2>
          <p className="text-sm text-gray-500 mt-1">
            Ingresá las credenciales de tu proyecto
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supabase URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://xyz.supabase.co"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Anon Key
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="eyJhbGciOi..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Conectar
        </button>

        <p className="text-xs text-gray-400 text-center">
          Las credenciales se guardan localmente en el navegador.
        </p>
      </form>
    </div>
  );
}
