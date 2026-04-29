export type Language = 'en' | 'es' | 'zh';

export const translations = {
  en: {
    title: "Arthromed AI",
    subtitle: "Surgical Precision Assistant",
    status: "System Active",
    welcome: "Welcome to Arthromed Surgical Assistant. How can I help you with our specialized medical equipment today?",
    placeholder: "Tap the microphone to start talking to Arthromed AI...",
    listening: "Listening...",
    typePlaceholder: "Type a message...",
    error: "I'm having trouble connecting to the system. Please ensure the backend is active.",
    apiPlaceholder: "This is a response from the Arthromed AI API for your message: \"{message}\". The backend is ready for LLM integration.",
    voiceLang: "en-US",
  },
  es: {
    title: "Arthromed AI",
    subtitle: "Asistente de Precisión Quirúrgica",
    status: "Sistema Activo",
    welcome: "Bienvenido al Asistente Quirúrgico de Arthromed. ¿En qué puedo ayudarle hoy con nuestro equipo médico especializado?",
    placeholder: "Toque el micrófono para empezar a hablar con Arthromed AI...",
    listening: "Escuchando...",
    typePlaceholder: "Escribe un mensaje...",
    error: "Tengo problemas para conectarme al sistema. Por favor, asegúrese de que el backend esté activo.",
    apiPlaceholder: "Esta es una respuesta de la API de Arthromed AI para su mensaje: \"{message}\". El backend está listo para la integración con LLM.",
    voiceLang: "es-ES",
  },
  zh: {
    title: "Arthromed AI",
    subtitle: "手术精准助手",
    status: "系统活跃",
    welcome: "欢迎使用 Arthromed 手术助手。今天我能如何帮助您了解我们的专业医疗设备？",
    placeholder: "点击麦克风开始与 Arthromed AI 对话...",
    listening: "正在倾听...",
    typePlaceholder: "输入消息...",
    error: "连接系统时出现问题。请确保后端已激活。",
    apiPlaceholder: "这是 Arthromed AI API 对您的消息的回复：\"{message}\"。后端已准备好进行 LLM 集成。",
    voiceLang: "zh-CN",
  }
};
