import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function Valores() {
  const [produtos, setProdutos] = useState([]);

  const valoresRef = collection(db, "valoresProdutos");

  const carregarValores = async () => {
    const snapshot = await getDocs(valoresRef);
    const lista = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProdutos(lista);
  };

  const atualizarValor = async (id, novoValor) => {
    const produto = produtos.find((p) => p.id === id);
    if (!produto) return;

    const docRef = doc(db, "valoresProdutos", id);
    await setDoc(docRef, { ...produto, valor: Number(novoValor) });

    carregarValores(); // atualiza após salvar
  };

  useEffect(() => {
    carregarValores();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center" }}>Configurar Valores dos Produtos</h2>
      {produtos.map((produto) => (
        <div
          key={produto.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
            borderBottom: "1px solid #ccc",
            paddingBottom: "10px",
          }}
        >
          <span style={{ fontWeight: "bold" }}>{produto.nome}</span>
          <input
            type="number"
            step="0.01"
            value={produto.valor}
            onChange={(e) =>
              atualizarValor(produto.id, e.target.value)
            }
            style={{
              padding: "6px",
              borderRadius: "5px",
              width: "100px",
              textAlign: "right",
              border: "1px solid #aaa",
            }}
          />
        </div>
      ))}
    </div>
  );
}
