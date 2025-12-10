import React, { useContext, useState } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import { emailVerificacao } from "../../utils/helper";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import Input from "../../components/Inputs/Input";
import { Link, useNavigate } from "react-router-dom";
import axiosReq from "../../utils/axiosReq";
import { API_PATHS } from "../../utils/apiUrl";
import { UserContext } from "../../context/userContext";
import uploadImage from "../../utils/uploadImage";

const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminInviteToken, setAdminInviteToken] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  const [userType, setUserType] = useState("security");

  const [error, setError] = useState(null);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Handle SignUp Form Submit
  const handleSignUp = async (e) => {
    e.preventDefault();

    let profileImageUrl = "";

    if (!fullName) {
      setError("Please enter full name.");
      return;
    }

    if (!emailVerificacao(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter the password");
      return;
    }

    setError("");

    //SignUp API Call
    try {
      // Upload image if present
      if (profilePic) {
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }

      const payload = {
        name: fullName,
        email,
        password,
        profileImageUrl,
      };
      if (userType === "security") {
        payload.adminInviteToken = adminInviteToken;
      } else if (userType === "company") {
        if (!empresaId) {
          setError("Informe o ID da empresa cliente.");
          return;
        }
        payload.empresaId = empresaId;
      }
      const response = await axiosReq.post(API_PATHS.AUTH.REGISTER, payload);

      const { token, role } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);

        //Redirect based on role
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
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Criar nova conta</h3>
        <p className="text-[14px] text-white mt-[5px] mb-6">
          Cadastre-se inserindo suas informações.
        </p>

        <form onSubmit={handleSignUp}>
          {/* Tipo de cadastro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="type_security"
                name="signup_type"
                checked={userType === "security"}
                onChange={() => setUserType("security")}
              />
              <label htmlFor="type_security" className="text-sm text-white">
                Membro do time de segurança
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="type_company"
                name="signup_type"
                checked={userType === "company"}
                onChange={() => setUserType("company")}
              />
              <label htmlFor="type_company" className="text-sm text-white">
                Membro de empresa cliente
              </label>
            </div>
          </div>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Nome"
              placeholder="Digite seu nome"
              type="text"
              labelClassName="text-[13px] text-white"
            />

            <Input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email"
              placeholder="Digite seu email"
              type="text"
              labelClassName="text-[13px] text-white"
            />

            <Input
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              label="Senha"
              placeholder="Digite uma senha com pelo menos 8 caracteres"
              type="password"
              labelClassName="text-[13px] text-white"
            />

            <Input
              hidden={userType === "company"}
              value={adminInviteToken}
              onChange={({ target }) => setAdminInviteToken(target.value)}
              label="Token de Admin (opcional)"
              placeholder="Digite o token se você for administrador"
              type="text"
              labelClassName="text-[13px] text-white"
            />
            {userType === "company" && (
              <Input
                value={empresaId}
                onChange={({ target }) => setEmpresaId(target.value)}
                label="ID da Empresa Cliente"
                placeholder="Digite o ID da empresa fornecido pelo admin"
                type="text"
                labelClassName="text-[13px] text-white"
              />
            )}
          </div>

          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

          <button type="submit" className="btn-primary">
            Cadastre-se
          </button>

          <p className="text-[13px] text-slate-100 mt-3">
            Já tem uma conta?{" "}
            <Link className="font-medium text-primary underline" to="/login">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
