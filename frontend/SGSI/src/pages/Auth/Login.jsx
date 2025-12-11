import { URLS_API } from "../../utils/apiUrl";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import axiosReq from "../../utils/axiosReq";
import Input from "../../components/Inputs/Input";
import React, { useContext, useState } from "react";
import AppEntry from "../../components/layouts/AppEntry";
import { emailVerificacao } from "../../utils/utils";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const verificaLogin = async (e) => {
    e.preventDefault();

    if (!password) {
      setError("Preencha a senha");
      return;
    }

    if (!emailVerificacao(email)) {
      setError("Digite um email válido.");
      return;
    }

    setError("");

    try {
      const response = await axiosReq.post(URLS_API.AUTH.LOGIN, {
        email,
        password,
      });

      const { token, role } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);

        if (role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Erro.");
      }
    }
  };

  return (
    <AppEntry>
      <div className="flex-col justify-center md:h-full lg:w-[70%] h-3/4 flex">
        <h3 className="font-semibold text-black text-xl">Bem-vindo!</h3>
        <p className="mt-[5px] text-[14px] mb-6 text-white">
          Digite seu email e senha para iniciar sessão
        </p>

        <form onSubmit={verificaLogin}>
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email"
            labelClassName="text-[13px] text-white"
            placeholder="Digite seu email"
            type="text"
          />

          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Senha"
            labelClassName="text-[13px] text-white"
            placeholder="Digite sua senha"
            type="password"
          />

          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

          <button type="submit" className="button-principal">
            Entrar
          </button>

          <p className="text-[13px] text-slate-100 mt-3">
            Não tem uma conta?{" "}
            <Link className="font-medium text-primary underline" to="/signup">
              Cadastre-se
            </Link>
          </p>
        </form>
      </div>
    </AppEntry>
  );
};

export default Login;
