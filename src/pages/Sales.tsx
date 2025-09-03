import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";

type Product = { id:string; name:string; code:string; selling_price:number; sell_by_weight?:boolean; };
type CartItem = { productId:string; name:string; unitPrice:number; qty:number; weightKg?:number; discountPct?:number; };

export default function Sales(){
  const { companyId } = useCompany();
  const [q,setQ]=useState(""); const [results,setResults]=useState<Product[]>([]);
  const [cart,setCart]=useState<CartItem[]>([]);
  const [method,setMethod]=useState<"CASH"|"CARD"|"PIX">("CASH");
  const [loading,setLoading]=useState(false);
  const [saleInfo,setSaleInfo]=useState<{saleId:string; saleNumber:string}|null>(null);

  useEffect(()=>{ let active=true;
    (async()=>{
      if(!q){ setResults([]); return; }
      const { data } = await supabase.from("products")
        .select("id,name,code,selling_price")
        .ilike("name", `%${q}%`).limit(20);
      if(active) setResults(data||[]);
    })(); return ()=>{active=false};
  },[q]);

  function addToCart(p:Product){
    setCart(prev=>{
      const i = prev.findIndex(x=>x.productId===p.id);
      if(i>=0){ const copy=[...prev]; copy[i]={...copy[i], qty: copy[i].qty+1}; return copy; }
      return [...prev, { productId:p.id, name:p.name, unitPrice:Number(p.selling_price), qty:1 }];
    });
  }

  function updateQty(id:string, qty:number){ setCart(prev=>prev.map(i=>i.productId===id?{...i, qty:Math.max(1,qty)}:i)); }
  function updateWeight(id:string, kg:number){ setCart(prev=>prev.map(i=>i.productId===id?{...i, weightKg:Math.max(0.01,kg)}:i)); }
  function updateDiscount(id:string, pct:number){ setCart(prev=>prev.map(i=>i.productId===id?{...i, discountPct:Math.max(0,Math.min(100,pct))}:i)); }
  function removeItem(id:string){ setCart(prev=>prev.filter(i=>i.productId!==id)); }
  function clear(){ setCart([]); setSaleInfo(null); setQ(""); }

  const subtotal = useMemo(()=> cart.reduce((acc,i)=>{
    const base = (i.weightKg ? i.weightKg : i.qty) * i.unitPrice;
    const disc = i.discountPct ? base*(i.discountPct/100) : 0;
    return acc + (base - disc);
  },0),[cart]);

  async function finalize(){
    if(!companyId || cart.length===0) return;
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const items = cart.map(i=>({
      product_id: i.productId,
      quantity: i.weightKg ? i.weightKg : i.qty,
      unit_price: i.unitPrice
    }));
    const res = await fetch(`https://ioebjmpteseatjsbyfxy.supabase.co/functions/v1/finalize-sale`,{
      method:"POST",
      headers:{ "Content-Type":"application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ items })
    });
    setLoading(false);
    if(!res.ok){ const e=await res.json().catch(()=>({error:"Erro"})); alert(e.error||"Erro"); return; }
    const out = await res.json();
    setSaleInfo({ saleId: out.sale.id, saleNumber: out.sale.sale_number });
    clear();
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div>
        <div className="flex gap-2">
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Buscar por nome…" value={q} onChange={e=>setQ(e.target.value)} />
          <button className="rounded-lg px-4 bg-black text-white" onClick={()=>setQ(q)}>Buscar</button>
        </div>
        <div className="mt-4 grid gap-2">
          {results.map(p=>(
            <button key={p.id} onClick={()=>addToCart(p)} className="text-left border rounded-lg p-3 hover:bg-gray-50">
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-500">Código: {p.code} • R$ {Number(p.selling_price).toFixed(2)}</div>
            </button>
          ))}
          {!q && <div className="text-sm text-gray-500">Digite para buscar produtos…</div>}
        </div>
      </div>
      <div>
        <div className="border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Carrinho</h2>
            <button onClick={clear} className="text-sm text-gray-600 hover:underline">Limpar</button>
          </div>
          <div className="space-y-3">
            {cart.map(i=>(
              <div key={i.productId} className="flex items-center justify-between border rounded-xl p-3">
                <div className="flex-1">
                  <div className="font-medium">{i.name}</div>
                  <div className="text-xs text-gray-500">R$ {i.unitPrice.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" min={1} step={1} className="w-20 border rounded px-2 py-1"
                    value={i.qty} onChange={e=>updateQty(i.productId, Number(e.target.value))} />
                  <input type="number" min={0} max={100} step={1} className="w-20 border rounded px-2 py-1"
                    placeholder="% desc" value={i.discountPct||0}
                    onChange={e=>updateDiscount(i.productId, Number(e.target.value))} />
                  <button onClick={()=>removeItem(i.productId)} className="text-sm text-red-500">remover</button>
                </div>
              </div>
            ))}
            {cart.length===0 && <div className="text-sm text-gray-500">Sem itens.</div>}
          </div>
          <div className="mt-4 border-t pt-3">
            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm">Pagamento:</label>
              <select className="border rounded px-2 py-1" value={method} onChange={e=>setMethod(e.target.value as any)}>
                <option value="CASH">Dinheiro</option>
                <option value="CARD">Cartão</option>
                <option value="PIX">Pix</option>
              </select>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <div>Total</div><div>R$ {subtotal.toFixed(2)}</div>
            </div>
            <button disabled={loading || cart.length===0} onClick={finalize}
              className="mt-3 w-full rounded-lg bg-black text-white py-2">
              {loading ? "Processando…" : "Finalizar Venda"}
            </button>
            {saleInfo && (
              <div className="text-sm text-green-700 mt-2">
                Venda #{saleInfo.saleNumber} concluída.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}