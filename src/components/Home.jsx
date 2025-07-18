import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import styled from "styled-components";
import { FaTrash } from "react-icons/fa";

// Styled Components
const Container = styled.div`
  padding: 2px;
  max-width: 900px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 25px;
  color: #2c3e50;
`;

const ProductsGrid = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
`;

const ProductPrice = styled.div`
  color: #c41e3a;
  font-weight: bold;
  transition: color 0.3s ease;
`;

const ProductCard = styled.div`
  cursor: pointer;
  background: ${({ selected }) => (selected ? "#C41E3A " : "white")};
  border-radius: 10px;
  padding: 15px;
  width: 140px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
  text-align: center;
  transition: background-color 0.3s ease, color 0.3s ease;
  user-select: none;

  &:hover {
    background: #c41e3a;
    color: white;

    ${ProductPrice} {
      color: white;
    }
  }
`;

const ProductImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 10px;
`;

const ProductName = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
  text-transform: capitalize;
`;

const QuantityContainer = styled.div`
  margin: 25px auto;
  max-width: 300px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
`;

const QuantityInput = styled.input`
  width: 70px;
  padding: 8px;
  font-size: 1rem;
  border-radius: 8px;
  border: 1.5px solid #ccc;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #c41e3a;
  }
`;

const AddButton = styled.button`
  background-color: #c41e3a;
  border: none;
  border-radius: 8px;
  color: white;
  padding: 10px 18px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.3s ease;
  user-select: none;

  &:hover {
    background-color: #d4883a;
  }
`;

const HistoryTitle = styled.h2`
  margin-top: 40px;
  margin-bottom: 15px;
  text-align: center;
  color: #2c3e50;
`;

const HistoryList = styled.ul`
  list-style: none;
  padding-left: 0;
  max-width: 600px;
  margin: 0 auto;
`;

const HistoryItem = styled.li`
  background: white;
  border-radius: 8px;
  padding: 12px 15px;
  margin-bottom: 12px;
  box-shadow: 0 1px 6px rgb(0 0 0 / 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ItemInfo = styled.div`
  font-weight: 600;
  color: #555;
  text-transform: capitalize;
`;

const ItemQuantity = styled.span`
  margin-left: 10px;
  font-weight: normal;
  color: #888;
`;

const ItemTotal = styled.div`
  font-weight: 700;
  color: #c41e3a;
  margin-right: 12px;
`;

const TrashButton = styled.button`
  background: transparent;
  border: none;
  color: #d9534f;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 4px;

  &:hover {
    color: #b52b27;
  }
`;

const FinalizeButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 14px 22px;
  background-color: ${({ confirm }) => (confirm ? "#d9534f" : "#C41E3A ")};
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  user-select: none;
  transition: background-color 0.3s ease;
`;

const SubtotalContainer = styled.div`
  text-align: center;
  margin-top: 20px;
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
`;

const QuantityButton = styled.button`
  background-color: #c41e3a;
  border: none;
  color: white;
  font-size: 1.2rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #d4883a;
  }
`;

export default function Home() {
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [confirmStep, setConfirmStep] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState("");
  const [valorPago, setValorPago] = useState("");

  const carregarProdutos = async () => {
    const snapshot = await getDocs(collection(db, "valoresProdutos"));
    const lista = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProdutos(lista);
  };

  const buscarPedidos = async () => {
    const querySnapshot = await getDocs(collection(db, "pedidos"));
    const lista = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPedidos(lista);
  };

  useEffect(() => {
    carregarProdutos();
    buscarPedidos();
  }, []);

  const subtotal = pedidos.reduce((acc, pedido) => acc + Number(pedido.total || 0), 0);

  const troco =
    formaPagamento === "dinheiro" && valorPago && Number(valorPago) >= subtotal
      ? (Number(valorPago) - subtotal).toFixed(2)
      : null;

  const adicionarPedido = async () => {
    if (!produtoSelecionado) {
      alert("Selecione um produto primeiro.");
      return;
    }
    if (quantidade <= 0) {
      alert("Quantidade deve ser maior que zero.");
      return;
    }
    const pedido = {
      produto: produtoSelecionado.nome,
      quantidade,
      valorUnitario: produtoSelecionado.valor,
      total: quantidade * produtoSelecionado.valor,
      data: new Date().toISOString(),
    };
    await addDoc(collection(db, "pedidos"), pedido);
    setQuantidade(1);
    setProdutoSelecionado(null);
    buscarPedidos();
  };

  const removerPedido = async (id) => {
    await deleteDoc(doc(db, "pedidos", id));
    buscarPedidos();
  };

  const finalizarDia = async () => {
  if (confirmStep === 0) {
    setConfirmStep(1);
    return;
  }

  if (confirmStep === 1) {
    const hojeStr = new Date().toISOString().slice(0, 10);
    const pedidosDoDia = pedidos.filter((p) => p.data.startsWith(hojeStr));

    if (pedidosDoDia.length === 0) {
      alert("Nenhum pedido registrado para hoje.");
      setConfirmStep(0);
      return;
    }

    try {
      const pedidosComPagamento = pedidosDoDia.map((pedido) => ({
        ...pedido,
        formaPagamento: formaPagamento || "não informado",
      }));

      await addDoc(collection(db, "diasFinalizados"), {
        data: hojeStr,
        pedidos: pedidosComPagamento,
        timestamp: new Date(),
      });

      for (const pedido of pedidosDoDia) {
        await deleteDoc(doc(db, "pedidos", pedido.id));
      }

      alert("Pedido finalizado com sucesso!");
      setConfirmStep(0);
      setFormaPagamento("");
      setValorPago("");
      buscarPedidos();
    } catch (error) {
      alert("Erro ao finalizar o dia: " + error.message);
      setConfirmStep(0);
    }
  }
};
  return (
    <Container>
      <Title>Controle de Vendas - Cura Ressaca</Title>

      <ProductsGrid>
        {produtos.map((prod) => (
          <ProductCard
            key={prod.id}
            selected={produtoSelecionado?.id === prod.id}
            onClick={() => setProdutoSelecionado(prod)}
          >
            <ProductImage src={prod.imagem} alt={prod.nome} />
            <ProductName>{prod.nome}</ProductName>
            <ProductPrice>R$ {prod.valor.toFixed(2)}</ProductPrice>
          </ProductCard>
        ))}
      </ProductsGrid>

      <QuantityContainer>
        <QuantityButton
          onClick={() => setQuantidade((prev) => Math.max(1, prev - 1))}
        >
          −
        </QuantityButton>

        <QuantityInput
          type="number"
          min="1"
          value={quantidade}
          onChange={(e) => setQuantidade(Number(e.target.value))}
          placeholder="Quantidade"
        />

        <QuantityButton onClick={() => setQuantidade((prev) => prev + 1)}>
          +
        </QuantityButton>

        <AddButton onClick={adicionarPedido}>Adicionar Pedido</AddButton>
      </QuantityContainer>

      <HistoryTitle>Últimos Pedidos</HistoryTitle>
      {pedidos.length === 0 ? (
        <p style={{ textAlign: "center", color: "#95a5a6" }}>
          Nenhum pedido cadastrado ainda.
        </p>
      ) : (
        <HistoryList>
          {pedidos.map((pedido) => (
            <HistoryItem key={pedido.id}>
              <ItemInfo>
                {pedido.produto}
                <ItemQuantity>× {pedido.quantidade}</ItemQuantity>
              </ItemInfo>
              <div style={{ display: "flex", alignItems: "center" }}>
                <ItemTotal>R$ {pedido.total.toFixed(2)}</ItemTotal>
                <TrashButton
                  onClick={() => removerPedido(pedido.id)}
                  title="Remover pedido"
                >
                  <FaTrash />
                </TrashButton>
              </div>
            </HistoryItem>
          ))}
        </HistoryList>
      )}

      {pedidos.length > 0 && (
        <SubtotalContainer>
          Subtotal: <strong>R$ {subtotal.toFixed(2)}</strong>
        </SubtotalContainer>
      )}

      {/* Opções de pagamento */}
      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <div style={{ marginBottom: "15px" }}>
          <strong>Forma de Pagamento:</strong>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            {["cartao", "pix", "dinheiro"].map((opcao) => (
              <button
                key={opcao}
                onClick={() => setFormaPagamento(opcao)}
                style={{
                  padding: "10px 15px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: formaPagamento === opcao ? "#C41E3A" : "#eee",
                  color: formaPagamento === opcao ? "#fff" : "#333",
                  fontWeight: "600",
                }}
              >
                {opcao.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {formaPagamento === "dinheiro" && (
          <div style={{ marginBottom: "10px" }}>
            <input
              type="number"
              placeholder="Valor pago"
              value={valorPago}
              onChange={(e) => setValorPago(e.target.value)}
              style={{
                padding: "10px",
                fontSize: "1rem",
                borderRadius: "8px",
                border: "1.5px solid #ccc",
                textAlign: "center",
                width: "150px",
              }}
            />
            {troco !== null && (
              <div
                style={{
                  marginTop: "10px",
                  color: "#2c3e50",
                  fontWeight: "bold",
                }}
              >
                Troco: R$ {troco}
              </div>
            )}
          </div>
        )}
      </div>

      <FinalizeButton confirm={confirmStep === 1} onClick={finalizarDia}>
        {confirmStep === 0
          ? "Finalizar Pedido"
          : "Clique novamente para confirmar"}
      </FinalizeButton>
    </Container>
  );
}

