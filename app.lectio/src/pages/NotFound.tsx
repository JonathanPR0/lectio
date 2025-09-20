import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Mensagens bíblicas divertidas para página 404
const BIBLICAL_MESSAGES = [
  {
    title: "Parece que você se perdeu no deserto...",
    verse:
      "Não tenha medo, pois estou com você. Não fique ansioso, pois eu sou o seu Deus. Vou fortalecê-lo, sim, vou ajudá-lo. Vou segurá-lo firmemente com a minha mão direita de justiça.’",
    reference: "Isaías 41:10",
    emoji: "🏜️",
  },
  {
    title: "Esta página desapareceu como Enoque...",
    verse:
      "Pela fé Enoque foi transferido para não ver a morte, e não foi achado em parte alguma, porque Deus o havia transferido; pois, antes de ser transferido, ele recebeu o testemunho de que havia agradado a Deus.",
    reference: "Hebreus 11:5",
    emoji: "✨",
  },
  {
    title: "Você está no lugar errado, como Jonas em Társis...",
    verse:
      "Então Jeová lançou um forte vento sobre o mar, e houve uma tempestade tão violenta no mar que o navio estava prestes a naufragar.",
    reference: "Jonas 1:4",
    emoji: "🌊",
  },
  {
    title: "Parece que você está perdido, como a ovelha perdida...",
    verse:
      "Pois o Filho do Homem veio procurar e salvar o que estava perdido.”",
    reference: "Lucas 19:10",
    emoji: "🐑",
  },
];

export default function NotFound() {
  const [message, setMessage] = useState(BIBLICAL_MESSAGES[0]);

  useEffect(() => {
    // Escolhe uma mensagem bíblica aleatória
    const randomIndex = Math.floor(Math.random() * BIBLICAL_MESSAGES.length);
    setMessage(BIBLICAL_MESSAGES[randomIndex]);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Conteúdo principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center max-w-md mx-auto bg-card p-8 rounded-lg border border-primary/20 shadow-lg"
      >
        <motion.div
          className="text-8xl mb-6 mx-auto"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ rotate: 10 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.3,
          }}
        >
          {message.emoji}
        </motion.div>

        <motion.h1
          className="text-7xl font-bold text-primary mb-4"
          animate={{
            y: [0, -10, 0],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut",
          }}
        >
          404
        </motion.h1>

        <motion.h2
          className="text-2xl font-semibold mb-4 text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {message.title}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-primary/10 p-4 rounded-md mb-6 relative"
        >
          <svg
            className="absolute top-0 left-0 text-primary/30 w-6 h-6 -translate-x-2 -translate-y-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-10zm-10 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <p className="text-foreground/80 italic text-sm mb-2">
            "{message.verse}"
          </p>
          <p className="text-center text-primary text-xs font-medium">
            {message.reference}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col gap-4"
        >
          <Button asChild>
            <Link to="/">Voltar para o início seguro</Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
