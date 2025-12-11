import React, { useEffect, useRef, useState } from "react";
import Home from "../../components/layouts/Home";
import { PRIORIDADE_DATA, CLASSIFICATION_DATA } from "../../utils/menus";
import axiosReq from "../../utils/axiosReq";
import { URLS_API } from "../../utils/apiUrl";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { LuTrash2 } from "react-icons/lu";
import { HiOutlineTrash, HiMiniPlus } from "react-icons/hi2";
import Lista from "../../components/Inputs/Lista";
import { NIST_CSF_DATA } from "../../utils/nistCsfData";
import { ISO_27001_DATA } from "../../utils/iso27001Data";
import ResponsaveisPopup from "../../components/Inputs/ResponsaveisPopup";
import ListaClientes from "../../components/Inputs/ListaClientes";
import ItensInput from "../../components/Inputs/ItensInput";
import Excluir from "../../components/Excluir";
import Popup from "../../components/Popup";

const getCorStatus = (status) => {
  switch (status) {
    case "Em Andamento":
      return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";
    case "Concluído":
      return "text-lime-500 bg-lime-50 border border-lime-500/20";
    default:
      return "text-violet-500 bg-violet-50 border border-violet-500/10";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "Em Andamento":
      return "Em Andamento";
    case "Concluído":
      return "Concluído";
    case "Pendente":
    default:
      return "Pendente";
  }
};

const CriarAcao = () => {
  const location = useLocation();
  const { acaoId } = location.state || {};
  const navigate = useNavigate();
  const [openFormPopup, setOpenFormPopup] = useState(true);

  const [acaoData, setAcaoData] = useState({
    title: "",
    descricao: "",
    classification: "NIST CSF",
    prioridade: "Baixa",
    previsao: null,
    responsavel: [],
    cliente: "",
    itens: [],
  });

  const [currentAcao, setCurrentAcao] = useState(null);
  const [checklistEditMode, setChecklistEditMode] = useState(false);
  const editChecklistRef = useRef(null);
  const editInputsRef = useRef([]);
  const [editFocusIndex, setEditFocusIndex] = useState(null);
  const [suppressOutsideOnce, setSuppressOutsideOnce] = useState(false);
  const [newTodoText, setNewTodoText] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAcao, setLoadingAcao] = useState(!!acaoId);

  const [openExcluir, setOpenExcluir] = useState(false);

  const isCascadeFramework =
    acaoData.classification === "NIST CSF" ||
    acaoData.classification === "ISO 27001";

  const frameworkData =
    acaoData.classification === "NIST CSF"
      ? NIST_CSF_DATA
      : acaoData.classification === "ISO 27001"
      ? ISO_27001_DATA
      : null;

  const functionOptions = frameworkData
    ? frameworkData.functions.map((f) => ({
        label: f.name,
        value: f.name,
      }))
    : [];

  const selectedFunction =
    frameworkData && acaoData.title
      ? frameworkData.functions.find((f) => f.name === acaoData.title)
      : null;

  const categoryOptions = selectedFunction
    ? selectedFunction.categories.map((c) => ({ label: c.name, value: c.name }))
    : [];

  const selectedCategory =
    selectedFunction && acaoData.descricao
      ? selectedFunction.categories.find((c) => c.name === acaoData.descricao)
      : null;

  const subcategoryOptions = selectedCategory
    ? selectedCategory.subcategories.map((s) => ({
        label: s.name,
        value: s.name,
      }))
    : [];

  const handleValueChange = (key, value) => {
    setAcaoData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleClassificationChange = (value) => {
    setAcaoData((prev) => ({
      ...prev,
      classification: value,
      title: "",
      descricao: "",
      itens: [],
    }));
  };

  const handleNistTitleChange = (value) => {
    setAcaoData((prev) => ({
      ...prev,
      title: value,
      descricao: "",
      itens: [],
    }));
  };

  const handleNistDescricaoChange = (value) => {
    setAcaoData((prev) => ({
      ...prev,
      descricao: value,
      itens: [],
    }));
  };

  const clearData = () => {
    setAcaoData({
      title: "",
      descricao: "",
      classification: "NIST CSF",
      prioridade: "Baixa",
      previsao: null,
      responsavel: [],
      cliente: "",
      itens: [],
    });
  };

  const createAcao = async () => {
    setLoading(true);

    try {
      const todolist = acaoData.itens?.map((item) => ({
        text: item,
        concluido: false,
      }));

      const response = await axiosReq.post(URLS_API.ACOES.CRIAR_ACAO, {
        ...acaoData,
        previsao: new Date(acaoData.previsao).toISOString(),
        itens: todolist,
      });

      toast.success("Ação criada com sucesso!");

      clearData();
    } catch (error) {
      console.error("Error creating acao:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const updateAcao = async () => {
    setLoading(true);

    try {
      const todolist = acaoData.itens?.map((item) => {
        const prevItens = currentAcao?.itens || [];
        const matchedAcao = prevItens.find((acao) => acao.text == item);

        return {
          text: item,
          concluido: matchedAcao ? matchedAcao.concluido : false,
        };
      });

      const response = await axiosReq.put(URLS_API.ACOES.EDITAR_ACAO(acaoId), {
        ...acaoData,
        previsao: new Date(acaoData.previsao).toISOString(),
        itens: todolist,
      });

      toast.success("Ação salva com sucesso!");
    } catch (error) {
      console.error("Error creating acao:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleChecklistItem = async (index) => {
    if (!acaoId) return;
    try {
      const next = Array.isArray(currentAcao?.itens)
        ? [...currentAcao.itens]
        : [];
      if (!next[index]) return;
      next[index] = { ...next[index], concluido: !next[index].concluido };

      const response = await axiosReq.put(
        URLS_API.ACOES.ATUALIZAR_ITENS_FEITOS(acaoId),
        { itens: next }
      );
      if (response.status === 200) {
        const updated = response.data?.acao;
        setCurrentAcao(updated);
        setAcaoData((prev) => ({
          ...prev,
          itens: Array.isArray(updated?.itens)
            ? updated.itens.map((i) => i.text)
            : [],
        }));
      }
    } catch (e) {
      // silent
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (!acaoData.title.trim()) {
      setError("Título é obrigatório.");
      return;
    }
    if (!acaoData.descricao.trim()) {
      setError("Descrição é obrigatória.");
      return;
    }
    if (!acaoData.cliente) {
      setError("Selecione um cliente.");
      return;
    }
    if (!acaoData.previsao) {
      setError("Data Prevista é obrigatório.");
      return;
    }

    if (acaoData.responsavel?.length === 0) {
      setError("Ação não atribuída a nenhum responsável.");
      return;
    }

    if (acaoData.itens?.length === 0) {
      setError("Adicione pelo menos um item.");
      return;
    }

    if (acaoId) {
      updateAcao();
      return;
    }

    createAcao();
  };

  const getAcaoDetailsByID = async () => {
    try {
      setLoadingAcao(true);
      const response = await axiosReq.get(URLS_API.ACOES.ACAO_DETALHE(acaoId));

      if (response.data) {
        const acaoInfo = response.data;
        setCurrentAcao(acaoInfo);

        setAcaoData((prevState) => ({
          title: acaoInfo.title,
          descricao: acaoInfo.descricao,
          classification: acaoInfo.classification || "NIST CSF",
          prioridade: acaoInfo.prioridade,
          previsao: acaoInfo.previsao
            ? moment(acaoInfo.previsao).format("YYYY-MM-DD")
            : null,
          responsavel: acaoInfo?.responsavel?.map((item) => item?._id) || [],
          cliente:
            (acaoInfo?.cliente && acaoInfo?.cliente?._id) ||
            acaoInfo?.cliente ||
            "",
          itens: acaoInfo?.itens?.map((item) => item?.text) || [],
        }));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingAcao(false);
    }
  };

  useEffect(() => {
    if (!checklistEditMode) return;
    const handleClickOutside = (e) => {
      if (suppressOutsideOnce) {
        setSuppressOutsideOnce(false);
        return;
      }
      if (
        editChecklistRef.current &&
        !editChecklistRef.current.contains(e.target)
      ) {
        commitChecklistChanges();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklistEditMode, suppressOutsideOnce]);

  useEffect(() => {
    if (checklistEditMode && editFocusIndex !== null) {
      const focus = () => {
        const el = editInputsRef.current?.[editFocusIndex];
        if (el && typeof el.focus === "function") {
          el.focus();
          const val = el.value;
          try {
            el.setSelectionRange(val.length, val.length);
            // eslint-disable-next-line no-empty
          } catch (_) {}
        }
      };
      setTimeout(focus, 0);
    }
  }, [checklistEditMode, editFocusIndex]);

  const commitChecklistChanges = async (nextTexts) => {
    if (!acaoId) return;
    try {
      const old = Array.isArray(currentAcao?.itens) ? currentAcao.itens : [];
      const byText = new Map(old.map((o) => [o.text, !!o.concluido]));
      const source = Array.isArray(nextTexts)
        ? nextTexts
        : acaoData?.itens || [];
      const updated = source.map((txt, idx) => ({
        text: txt,
        concluido: byText.has(txt) ? byText.get(txt) : !!old[idx]?.concluido,
      }));
      const res = await axiosReq.put(
        URLS_API.ACOES.ATUALIZAR_ITENS_FEITOS(acaoId),
        { itens: updated }
      );
      if (res.status === 200) {
        setCurrentAcao(res.data?.acao);
      }
    } catch (e) {
      // ignore
    } finally {
      setChecklistEditMode(false);
      setEditFocusIndex(null);
      setNewTodoText("");
    }
  };

  const handleEditItemChange = (index, value) => {
    setAcaoData((prev) => {
      const next = [...(prev.itens || [])];
      next[index] = value;
      return { ...prev, itens: next };
    });
  };

  const handleDeleteItem = (index) => {
    setAcaoData((prev) => {
      const next = (prev.itens || []).filter((_, i) => i !== index);
      commitChecklistChanges(next);
      return { ...prev, itens: next };
    });
  };

  const handleAddItem = () => {
    const v = (newTodoText || "").trim();
    if (!v) return;
    setAcaoData((prev) => {
      const exists = (prev.itens || []).some((t) => t === v);
      const next = exists ? prev.itens : [...(prev.itens || []), v];
      commitChecklistChanges(next);
      return { ...prev, itens: next };
    });
    setNewTodoText("");
  };

  const deleteAcao = async () => {
    try {
      await axiosReq.delete(URLS_API.ACOES.APAGAR_ACAO(acaoId));

      setOpenExcluir(false);
      toast.success("Ação excluída com sucesso!");
      navigate("/admin/acoes");
    } catch (error) {
      console.error(
        "Error deleting:",
        error.response?.data?.message || error.message
      );
    }
  };

  useEffect(() => {
    if (acaoId) {
      getAcaoDetailsByID(acaoId);
    }

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acaoId]);

  const closeAndGoBack = () => {
    setOpenFormPopup(false);
    setTimeout(() => {
      navigate(-1);
    }, 0);
  };

  if (acaoId && loadingAcao && !currentAcao) {
    return (
      <Home activeMenu="Create Acao">
        <Popup
          aberto={openFormPopup}
          onClose={closeAndGoBack}
          title={"A��o"}
          variant="wide"
        >
          <div className="grid grid-cols-1 mt-1">
            <div className="form-content-box">
              <h2 className="text-sm md:text-xl font-medium mb-2">
                Carregando dados da ação...
              </h2>
              <p className="text-xs md:text-[13px] text-slate-500">
                Aguarde enquanto buscamos as informações da ação selecionada.
              </p>
            </div>
          </div>
        </Popup>
      </Home>
    );
  }

  return (
    <Home activeMenu="Create Acao">
      <Popup
        aberto={openFormPopup}
        onClose={closeAndGoBack}
        title={"Ação"}
        variant="wide"
        footer={
          <div className="flex justify-end">
            <button
              className="adicionar-button w-auto px-6"
              onClick={handleSubmit}
              disabled={loading}
            >
              {"Salvar"}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 mt-1">
          <div className="form-content-box">
            <div className="flex items-center justify-between">
              {acaoId && (
                <div
                  className={`text-[11px] md:text-[13px] font-medium ${getCorStatus(
                    currentAcao?.status || "Pendente"
                  )} px-3 py-1 rounded`}
                >
                  {getStatusLabel(currentAcao?.status || "Pendente")}
                </div>
              )}
              {acaoId && (
                <button
                  className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300 cursor-pointer"
                  onClick={() => setOpenExcluir(true)}
                >
                  <LuTrash2 className="text-base" /> Apagar
                </button>
              )}
            </div>

            <div className="grid grid-cols-12 gap-4 mt-2">
              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Classificação
                </label>

                <Lista
                  options={CLASSIFICATION_DATA}
                  value={acaoData.classification}
                  onChange={(value) => handleClassificationChange(value)}
                  placeholder="Select Classification"
                />
              </div>

              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Prioridade
                </label>

                <Lista
                  options={PRIORIDADE_DATA}
                  value={acaoData.prioridade}
                  onChange={(value) => handleValueChange("prioridade", value)}
                  placeholder="Selecione a prioridade"
                />
              </div>

              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Previsto
                </label>

                <input
                  placeholder="Create App UI"
                  className="form-input"
                  value={acaoData.previsao}
                  onChange={({ target }) =>
                    handleValueChange("previsao", target.value)
                  }
                  type="date"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">
                Título
              </label>

              {isCascadeFramework ? (
                <div className="relative">
                  <Lista
                    options={functionOptions}
                    value={acaoData.title}
                    onChange={(value) => handleNistTitleChange(value)}
                    placeholder="Selecione um item"
                  />
                </div>
              ) : (
                <input
                  placeholder="Create App UI"
                  className="form-input"
                  value={acaoData.title}
                  onChange={({ target }) =>
                    handleValueChange("title", target.value)
                  }
                />
              )}
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Descrição
              </label>

              {isCascadeFramework ? (
                <div className="relative opacity-100">
                  <div
                    className={!acaoData.title ? "opacity-50" : "opacity-100"}
                  >
                    <Lista
                      options={categoryOptions}
                      value={acaoData.descricao}
                      onChange={(value) => handleNistDescricaoChange(value)}
                      placeholder={
                        acaoData.title
                          ? "Selecione um item"
                          : "Selecione Título antes"
                      }
                    />
                  </div>
                </div>
              ) : (
                <textarea
                  placeholder="Describe acao"
                  className="form-input"
                  rows={4}
                  value={acaoData.descricao}
                  onChange={({ target }) =>
                    handleValueChange("descricao", target.value)
                  }
                />
              )}
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-600">
                  Itens
                </label>
              </div>

              {acaoId ? (
                <div className="mt-1" ref={editChecklistRef}>
                  {(acaoData?.itens || []).map((text, index) => (
                    <div
                      key={`todo_row_${index}`}
                      className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 mt-2 pr-3"
                    >
                      <input
                        className="form-input flex-1 mt-0"
                        value={text}
                        readOnly={isCascadeFramework}
                        onChange={
                          isCascadeFramework
                            ? undefined
                            : (e) => handleEditItemChange(index, e.target.value)
                        }
                        onBlur={
                          isCascadeFramework
                            ? undefined
                            : (e) => {
                                const next = (acaoData?.itens || []).map(
                                  (t, i) => (i === index ? e.target.value : t)
                                );
                                commitChecklistChanges(next);
                              }
                        }
                        ref={(el) => (editInputsRef.current[index] = el)}
                      />
                      <input
                        type="checkbox"
                        checked={!!currentAcao?.itens?.[index]?.concluido}
                        onChange={() => toggleChecklistItem(index)}
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none cursor-pointer"
                      />
                      <button
                        className="cursor-pointer"
                        onClick={() => handleDeleteItem(index)}
                        title="Remove"
                      >
                        <HiOutlineTrash className="text-lg text-red-500" />
                      </button>
                    </div>
                  ))}

                  {isCascadeFramework ? (
                    <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 mt-2 pr-3">
                      <div className="relative">
                        <div
                          className={
                            !acaoData.title || !acaoData.descricao
                              ? "opacity-50"
                              : "opacity-100"
                          }
                        >
                          <Lista
                            options={subcategoryOptions}
                            value={newTodoText}
                            onChange={(value) => setNewTodoText(value)}
                            placeholder={
                              acaoData.descricao
                                ? "Selecione um item"
                                : acaoData.title
                                ? "Selecione Descrição antes"
                                : "Selecione Título antes"
                            }
                          />
                        </div>
                      </div>
                      <button
                        className="content-box-btn text-nowrap dark:!text-white"
                        onClick={handleAddItem}
                        disabled={!newTodoText}
                      >
                        <HiMiniPlus className="text-lg" /> Adicionar
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 mt-2 pr-3">
                      <input
                        type="text"
                        placeholder="Enter Acao"
                        value={newTodoText}
                        onChange={(e) => setNewTodoText(e.target.value)}
                        className="form-input flex-1 mt-0"
                      />
                      <button
                        className="content-box-btn text-nowrap dark:!text-white"
                        onClick={handleAddItem}
                      >
                        <HiMiniPlus className="text-lg" /> Adicionar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-1">
                  {isCascadeFramework ? (
                    <>
                      {(acaoData?.itens || []).map((text, index) => (
                        <div
                          key={`todo_row_create_${index}`}
                          className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 mt-2 pr-3"
                        >
                          <input
                            className="form-input flex-1 mt-0"
                            value={text}
                            readOnly
                          />
                          <input
                            type="checkbox"
                            disabled
                            className="w-4 h-4 opacity-50"
                          />
                          <button
                            className="cursor-pointer"
                            onClick={() => handleDeleteItem(index)}
                            title="Remove"
                          >
                            <HiOutlineTrash className="text-lg text-red-500" />
                          </button>
                        </div>
                      ))}
                      <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 mt-2 pr-3">
                        <div className="relative">
                          <div
                            className={
                              !acaoData.title || !acaoData.descricao
                                ? "opacity-50"
                                : "opacity-100"
                            }
                          >
                            <Lista
                              options={subcategoryOptions}
                              value={newTodoText}
                              onChange={(value) => setNewTodoText(value)}
                              placeholder={
                                acaoData.descricao
                                  ? "Selecione um item"
                                  : acaoData.title
                                  ? "Selecione Descrição antes"
                                  : "Selecione Título antes"
                              }
                            />
                          </div>
                        </div>
                        <button
                          className="content-box-btn text-nowrap dark:!text-white"
                          onClick={handleAddItem}
                          disabled={!newTodoText}
                        >
                          <HiMiniPlus className="text-lg" /> Adicionar
                        </button>
                      </div>
                    </>
                  ) : (
                    <ItensInput
                      todoList={acaoData?.itens}
                      setTodoList={(value) => handleValueChange("itens", value)}
                    />
                  )}
                </div>
              )}
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Cliente
              </label>
              <ListaClientes
                value={acaoData.cliente}
                onChange={(value) => handleValueChange("cliente", value)}
              />
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Responsável
              </label>

              <ResponsaveisPopup
                selectedUsers={acaoData.responsavel}
                setSelectedUsers={(value) => {
                  handleValueChange("responsavel", value);
                }}
              />
            </div>

            {error && (
              <p className="text-xs font-medium text-red-500 mt-5">{error}</p>
            )}
          </div>
        </div>
      </Popup>

      <Popup
        aberto={openExcluir}
        onClose={() => setOpenExcluir(false)}
        title="Apagar ação"
      >
        <Excluir
          content="Você deseja apagar essa ação?"
          onDelete={() => deleteAcao()}
        />
      </Popup>
    </Home>
  );
};

export default CriarAcao;
