// import { Injectable } from "@kernel/decorators/Injectable";
// import { Invoice } from "src/entities/Invoice";
// import { Service } from "src/entities/Service";
// import { InvoiceRepository } from "../../repositories/InvoiceRepository";
// import { ServiceRepository } from "../../repositories/ServiceRepository";
// import { UnitOfWork } from "../UnitOfWork";

// @Injectable()
// export class CreateInvoiceUnitOfWork extends UnitOfWork {
//   constructor(
//     private readonly invoiceRepository: InvoiceRepository,
//     private readonly serviceRepository: ServiceRepository
//   ) {
//     super();
//   }

//   async run({ invoice, services }: CreateInvoiceUnitOfWork.RunParams): Promise<void> {
//     this.addPut(this.invoiceRepository.getPutCommandInput(invoice));
//     for (const service of services) {
//       this.addPut(this.serviceRepository.getPutCommandInput(service));
//     }
//     await this.commit();
//   }
// }

// export namespace CreateInvoiceUnitOfWork {
//   export type RunParams = {
//     invoice: Invoice;
//     services: Service[];
//   };
// }
