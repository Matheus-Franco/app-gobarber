import React, { useRef, useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  View,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Feather';
import getValidationErrors from '../../utils/getValidationErrors';

import api from '../../services/api';
import { useAuth } from '../../hooks/auth';

import Input from '../../components/Input';
import Button from '../../components/Button';

import {
  Container,
  BackButton,
  UserAvatarButton,
  UserAvatar,
  Title,
} from './styles';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
}

const SignUp: React.FC = () => {
  const { user } = useAuth();
  const { goBack } = useNavigation();

  const formRef = useRef<FormHandles>(null);
  const emailInputRef = useRef<TextInput>(null);
  const oldPasswordInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const navigation = useNavigation();

  const handleSignUp = useCallback(
    async (data: SignUpFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Campo obrigatório.'),
          email: Yup.string()
            .required('Campo obrigatório.')
            .email('Digite um E-mail válido.'),
          password: Yup.string().min(6, 'Minimo de 6 caracteres.'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        await api.post('users', data);

        Alert.alert(
          'Cadastro realizado com sucesso!',
          'Você já pode fazer o Logon.',
        );

        navigation.goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const error = getValidationErrors(err);

          formRef.current?.setErrors(error);
        }

        Alert.alert('Erro no cadastro', 'Ocorreu um erro, tente novamente.');
      }
    },
    [navigation],
  );

  const handleGoBack = useCallback(() => {
    goBack();
  }, [goBack]);

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Container>
            <BackButton onPress={handleGoBack}>
              <Icon name="chevron-left" size={24} color="#999591" />
            </BackButton>

            <UserAvatarButton onPress={() => {}}>
              <UserAvatar source={{ uri: user.avatar_url }} />
            </UserAvatarButton>

            <View>
              <Title>Meu perfil</Title>
            </View>

            <Form onSubmit={handleSignUp} ref={formRef}>
              <Input
                autoCapitalize="words"
                name="name"
                icon="user"
                placeholder="Nome"
                returnKeyType="next"
                onSubmitEditing={() => {
                  emailInputRef.current?.focus();
                }}
              />

              <Input
                ref={emailInputRef}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                name="email"
                icon="mail"
                placeholder="E-mail"
                returnKeyType="next"
                onSubmitEditing={() => {
                  oldPasswordInputRef.current?.focus();
                }}
              />

              <Input
                ref={oldPasswordInputRef}
                secureTextEntry
                textContentType="newPassword"
                name="old_password"
                icon="lock"
                placeholder="Senha atual"
                returnKeyType="next"
                containerStyle={{ marginTop: 16 }}
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                }}
              />

              <Input
                ref={passwordInputRef}
                secureTextEntry
                textContentType="newPassword"
                name="password"
                icon="lock"
                placeholder="Nova senha"
                returnKeyType="next"
                onSubmitEditing={() => {
                  confirmPasswordInputRef.current?.focus();
                }}
              />

              <Input
                ref={confirmPasswordInputRef}
                secureTextEntry
                textContentType="newPassword"
                name="password_confirmation"
                icon="lock"
                placeholder="Confirmar senha"
                returnKeyType="send"
                onSubmitEditing={() => formRef.current?.submitForm()}
              />
            </Form>

            <Button onPress={() => formRef.current?.submitForm()}>
              Confirmar mudanças
            </Button>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default SignUp;
