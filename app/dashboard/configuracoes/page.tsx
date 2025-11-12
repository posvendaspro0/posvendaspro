import { requireClient } from '@/lib/auth-helpers';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, User, Bell, Lock, Palette } from 'lucide-react';

/**
 * Página de Configurações
 * Em desenvolvimento - Em breve
 */
export default async function ConfiguracoesPage() {
  await requireClient();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500 mt-1">
          Personalize sua experiência no PósVendas Pro
        </p>
      </div>

      {/* Card de "Em Breve" */}
      <Card className="border-2 border-dashed border-slate-300">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-gradient-to-br from-slate-500 to-slate-700 p-6 mb-6">
            <Settings className="h-12 w-12 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Em Breve: Central de Configurações
          </h2>
          
          <p className="text-slate-600 text-center max-w-md mb-8">
            Personalize o sistema de acordo com as necessidades da sua empresa. Configure notificações, preferências e muito mais.
          </p>

          {/* Preview de Recursos */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 w-full max-w-5xl">
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">
                Perfil da Empresa
              </h3>
              <p className="text-sm text-slate-600">
                Edite dados cadastrais e informações
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                <Bell className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">
                Notificações
              </h3>
              <p className="text-sm text-slate-600">
                Configure alertas por email e WhatsApp
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-3">
                <Lock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">
                Segurança
              </h3>
              <p className="text-sm text-slate-600">
                Altere senha e configure autenticação
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-100 mb-3">
                <Palette className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">
                Aparência
              </h3>
              <p className="text-sm text-slate-600">
                Personalize cores e tema do sistema
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 mb-3">
                <Settings className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">
                Preferências
              </h3>
              <p className="text-sm text-slate-600">
                Defina padrões e automações
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              ⚙️ <span className="font-medium">Em breve:</span> Painel completo de configurações disponível!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

