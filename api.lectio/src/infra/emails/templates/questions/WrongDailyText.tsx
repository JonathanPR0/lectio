import { TailwindConfig } from "@infra/emails/components/TailwindConfig";
import {
  Body,
  Column,
  Container,
  Heading,
  Hr,
  Html,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { formatDate } from "date-fns/format";
import React from "react";

interface IWrongDailyTextProps {
  user_name?: string;
  user_email?: string;
  title: string;
  message: string;
  daily_text_date: Date;
}

export default function WrongDailyText({
  user_name,
  user_email,
  title,
  message,
  daily_text_date,
}: IWrongDailyTextProps) {
  return (
    <TailwindConfig>
      <Html lang="pt-BR">
        <Body className="m-0 bg-gray-100 font-sans text-gray-900">
          <Container className="mx-auto max-w-[600px] px-4 py-8">
            <Section className="overflow-hidden rounded-lg bg-white shadow-sm">
              <Row>
                <Column className="bg-lectio-green px-8 py-7">
                  <Text className="m-0 text-xs font-bold uppercase tracking-[2px] text-white">
                    Lectio · Moderação
                  </Text>
                  <Heading as="h1" className="mb-0 mt-3 text-2xl font-bold text-white">
                    Novo relato recebido
                  </Heading>
                  <Text className="mb-0 mt-2 text-sm leading-6 text-white">
                    Um usuário identificou uma possível inconsistência no texto diário.
                  </Text>
                </Column>
              </Row>

              <Row>
                <Column className="px-8 pb-2 pt-8">
                  <Text className="m-0 text-xs font-bold uppercase tracking-[1px] text-lectio-green">
                    Problema reportado
                  </Text>
                  <Heading as="h2" className="mb-0 mt-2 text-xl font-bold leading-7 text-gray-900">
                    {title}
                  </Heading>
                  <Text className="mb-0 mt-2 text-sm text-gray-600">
                    Texto Diário: {formatDate(daily_text_date, "dd/MM/yyyy")}
                  </Text>
                </Column>
              </Row>

              <Row>
                <Column className="px-8 py-6">
                  <Section className="rounded-md border-l-4 border-lectio-green bg-gray-100 px-5 py-4">
                    <Text className="m-0 whitespace-pre-line text-base leading-7 text-gray-900">
                      {message}
                    </Text>
                  </Section>
                </Column>
              </Row>

              <Row>
                <Column className="px-8 pb-8">
                  <Hr className="my-0 border-gray-200" />
                  <Text className="mb-0 mt-6 text-xs font-bold uppercase tracking-[1px] text-gray-500">
                    Relatado por
                  </Text>
                  <Text className="mb-0 mt-2 text-sm leading-6 text-gray-900">
                    <strong>{user_name || "Anônimo"}</strong>
                    <br />
                    <span className="text-gray-600">{user_email || "anonimo@email.com"}</span>
                  </Text>
                </Column>
              </Row>
            </Section>
            <Text className="m-0 px-4 pt-5 text-center text-xs leading-5 text-gray-500">
              Este email foi gerado automaticamente pelo Lectio.
            </Text>
          </Container>
        </Body>
      </Html>
    </TailwindConfig>
  );
}

WrongDailyText.PreviewProps = {
  user_name: "João da Silva",
  user_email: "joao@example.com",
  title: "A referência bíblica não corresponde ao texto",
  message: "A passagem exibida parece estar diferente da reflexão apresentada.",
  daily_text_date: new Date(2026, 7, 28),
};
