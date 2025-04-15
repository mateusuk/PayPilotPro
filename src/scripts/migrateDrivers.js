import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB5a1LISRQeZBIElY7PMR4OLfl_X-uW_3M",
  authDomain: "paypilotpro-bf363.firebaseapp.com",
  projectId: "paypilotpro-bf363",
  storageBucket: "paypilotpro-bf363.firebasestorage.app",
  messagingSenderId: "274078310781",
  appId: "1:274078310781:web:137dbab555994b88986c14",
  measurementId: "G-BX40Q1BLQ7"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const migrateDrivers = async () => {
  try {
    console.log('Iniciando migração dos drivers...');
    
    // Buscar todos os drivers
    const driversRef = collection(db, 'drivers');
    const driversSnapshot = await getDocs(driversRef);
    
    let totalDrivers = 0;
    let updatedDrivers = 0;
    
    // Iterar sobre cada driver
    for (const driverDoc of driversSnapshot.docs) {
      totalDrivers++;
      const driverData = driverDoc.data();
      
      // Se o driver já tem userId, pular
      if (driverData.userId) {
        console.log(`Driver ${driverDoc.id} já tem userId, pulando...`);
        continue;
      }
      
      // Usar o createdBy como userId, ou o primeiro usuário que criou o registro
      const userId = driverData.createdBy || 'default_user_id';
      
      // Atualizar o documento
      try {
        await updateDoc(doc(db, 'drivers', driverDoc.id), {
          userId: userId,
          updatedAt: new Date()
        });
        
        updatedDrivers++;
        console.log(`Driver ${driverDoc.id} atualizado com sucesso. userId: ${userId}`);
      } catch (error) {
        console.error(`Erro ao atualizar driver ${driverDoc.id}:`, error);
      }
    }
    
    console.log('\nMigração concluída!');
    console.log(`Total de drivers processados: ${totalDrivers}`);
    console.log(`Drivers atualizados: ${updatedDrivers}`);
    
  } catch (error) {
    console.error('Erro durante a migração:', error);
  }
};

// Executar a migração
migrateDrivers().then(() => {
  console.log('Script de migração finalizado.');
  process.exit(0);
}).catch((error) => {
  console.error('Erro fatal durante a migração:', error);
  process.exit(1);
}); 