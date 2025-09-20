import { TailwindConfig } from "@infra/emails/components/TailwindConfig";
import { Column, Heading, Html, Row, Section, Text } from "@react-email/components";
import React from "react";

interface IForgotPasswordProps {
  confirmationCode: string;
}

export default function ForgotPassword({ confirmationCode }: IForgotPasswordProps) {
  return (
    <TailwindConfig>
      <Html>
        <Section>
          <Row>
            <Column className="font-sans text-center pt-10">
              <Heading as="h1" className="text-2xl leading-[0]">
                Recupere a sua conta
              </Heading>
              <Heading as="h2" className="font-normal text-base text-gray-600">
                Resete a sua senha e volte ao controle
              </Heading>
            </Column>
          </Row>

          <Row>
            <Column className="text-center pt-10">
              <span className="bg-gray-200 inline-block px-8 py-4 text-3xl font-sans rounded-md font-bold tracking-[16px]">
                {confirmationCode}
              </span>
            </Column>
          </Row>

          <Row>
            <Column className="font-sans text-center pt-10">
              <Text className="text-sm text-gray-600">
                Se você não solicitou esta troca, fique tranquilo, sua conta continua segura!
              </Text>
            </Column>
          </Row>
        </Section>
      </Html>
    </TailwindConfig>
  );
}

ForgotPassword.PreviewProps = {
  confirmationCode: "336318",
};
