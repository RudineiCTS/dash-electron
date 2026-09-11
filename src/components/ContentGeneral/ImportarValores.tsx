import { ColarPlanilhaImport } from "./SharedGeneral/CopiaPorPipe";
import { LinhaPreview, PreviewImportacao } from "./SharedGeneral/PreviewTableImportacao";

export function ImportarValores(){
    return (
        <div className="flex flex-col pb-3">
            <div>
                <ColarPlanilhaImport
                    onProcessarColagem={()=>{}}
                    onUploadArquivo={()=>{}}
                    />
            </div>
                <PreviewImportacao
                    linhas={linhasPreviewMock}
                    onAlterarCelula={(id, campo, valor) => console.log(id, campo, valor)}
                    onDescartarImportacao={() => console.log("descartado")}
                /> 
        </div>

    )

}


export const linhasPreviewMock: LinhaPreview[] = [
  {
    idVendedor: 1187,
    nome: "Aline Ferreira",
    cobertura: 82.5,
    metaSetor: 48000.0,
    metaLojaVirtual: 9500.0,
  },
  {
    idVendedor: 1204,
    nome: "Bruno Tavares",
    cobertura: 76.0,
    metaSetor: 42500.0,
    metaLojaVirtual: 8200.0,
  },
  {
    idVendedor: 1355,
    nome: "Carla Menezes",
    cobertura: 88.2,
    metaSetor: 51300.0,
    metaLojaVirtual: 10400.0,
  },
  {
    idVendedor: 1402,
    nome: "Diego Ramos",
    cobertura: 71.4,
    metaSetor: 39800.0,
    metaLojaVirtual: 7600.0,
  },
  {
    idVendedor: 1478,
    nome: "Elisa Cardoso",
    cobertura: 79.9,
    metaSetor: 45200.0,
    metaLojaVirtual: 8900.0,
  },
  {
    idVendedor: 1502,
    nome: "Tatiane Moreira",
    cobertura: 68.3,
    metaSetor: 36400.0,
    metaLojaVirtual: 6800.0,
  },
];