import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from 'src/entities/payment.entity';
import { Receipt } from 'src/entities/receipt.entity';
import { PaymentService } from './payment.service';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class ReceiptService {
  private readonly logger = new Logger(ReceiptService.name);

  constructor(
    @InjectRepository(Receipt)
    private receiptRepository: Repository<Receipt>,
    private paymentService: PaymentService
  ) {}

  private async generatePDFBuffer(payment: Payment): Promise<{ buffer: Buffer; fileName: string }> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: 'Quittance de Loyer',
            Author: 'ImmoGest',
            Subject: 'Quittance de Loyer',
          }
        });

        const buffers: Buffer[] = [];
        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          const dueDate = new Date(payment.dueDate);
          const month = dueDate.toLocaleString('fr-FR', { month: 'long' });
          const year = dueDate.getFullYear();
          const fileName = `quittance_${month}_${year}.pdf`;
          resolve({ buffer: pdfBuffer, fileName });
        });
        doc.on('error', reject);

        // Style par défaut
        doc.font('Helvetica');
        
        // En-tête
        doc.fontSize(20)
           .text('QUITTANCE DE LOYER', { align: 'center' })
           .moveDown(2);

        // Cadre Bailleur
        doc.fontSize(12)
           .text('BAILLEUR', { underline: true })
           .moveDown(0.5);
        doc.fontSize(10)
           .text([
             `${payment.paymentSchedule.rental.property.owner.firstName} ${payment.paymentSchedule.rental.property.owner.lastName}`,
             payment.paymentSchedule.rental.property.owner.address || '',
             payment.paymentSchedule.rental.property.owner.email,
             payment.paymentSchedule.rental.property.owner.phone || ''
           ].filter(Boolean).join('\n'))
           .moveDown(1.5);

        // Cadre Locataire
        doc.fontSize(12)
           .text('LOCATAIRE', { underline: true })
           .moveDown(0.5);
        doc.fontSize(10)
           .text([
             `${payment.paymentSchedule.rental.tenant.firstName} ${payment.paymentSchedule.rental.tenant.lastName}`,
             payment.paymentSchedule.rental.tenant.address || '',
             payment.paymentSchedule.rental.tenant.email,
             payment.paymentSchedule.rental.tenant.phone || ''
           ].filter(Boolean).join('\n'))
           .moveDown(1.5);

        // Cadre Logement
        doc.fontSize(12)
           .text('LOGEMENT', { underline: true })
           .moveDown(0.5);
        doc.fontSize(10)
           .text([
             `${payment.paymentSchedule.rental.property.identifier},`,
             payment.paymentSchedule.rental.property.address
           ].join('\n'))
           .moveDown(1.5);

        // Cadre Paiement
        const month = new Date(payment.dueDate).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
        doc.fontSize(12)
           .text('DÉTAILS DU PAIEMENT', { underline: true })
           .moveDown(0.5);
        doc.fontSize(10)
           .text([
             `Période : ${month}`,
             `Montant du loyer : ${payment.amount.toFixed(2)} €`,
             `Date de paiement : ${payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('fr-FR') : 'Non payé'}`,
             `Méthode de paiement : ${payment.paymentMethod || 'Non spécifié'}`
           ].join('\n'))
           .moveDown(2);

        // Mention légale
        doc.fontSize(10)
           .text('Pour quittance, sous réserve de l\'encaissement du règlement.', {
             align: 'center',
             width: doc.page.width - 100
           })
           .moveDown(2);

        // Date et signature
        const date = new Date().toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        doc.fontSize(10)
           .text(`Fait à _____________, le ${date}`, { align: 'right' })
           .moveDown(2)
           .text('Signature du bailleur :', { align: 'right' })
           .moveDown(3);

        // Pied de page
        doc.fontSize(8)
           .fillColor('grey')
           .text('Document généré automatiquement par ImmoGest', {
             align: 'center'
           });

        doc.end();
      } catch (error) {
        this.logger.error('Erreur lors de la génération du PDF:', error);
        reject(error);
      }
    });
  }

  async previewReceipt(payment: Payment): Promise<Buffer> {
    this.logger.debug(`Prévisualisation de quittance pour le paiement #${payment.id}`);
    const { buffer } = await this.generatePDFBuffer(payment);
    return buffer;
  }

  async generateAndSaveReceipt(payment: Payment): Promise<Buffer> {
    this.logger.debug(`Génération et sauvegarde de quittance pour le paiement #${payment.id}`);
    
    // Vérifier si une quittance existe déjà pour ce paiement
    const existingReceipt = await this.receiptRepository.findOne({
      where: { payment: { id: payment.id } }
    });

    if (existingReceipt) {
      return existingReceipt.pdfContent;
    }

    const { buffer, fileName } = await this.generatePDFBuffer(payment);
    const dueDate = new Date(payment.dueDate);
    
    const receipt = this.receiptRepository.create({
      pdfContent: buffer,
      fileName,
      month: dueDate.toLocaleString('fr-FR', { month: 'long' }),
      year: dueDate.getFullYear(),
      payment,
      property: payment.paymentSchedule.rental.property,
      owner: payment.paymentSchedule.rental.property.owner,
      tenant: payment.paymentSchedule.rental.tenant,
      amount: payment.amount,
      paymentDate: payment.paidAt
    });

    await this.receiptRepository.save(receipt);
    return buffer;
  }

  async getReceipt(id: number): Promise<Receipt> {
    return this.receiptRepository.findOne({
      where: { id },
      relations: ['payment', 'property', 'owner', 'tenant']
    });
  }

  async getReceiptsByPayment(paymentId: number): Promise<Receipt[]> {
    return this.receiptRepository.find({
      where: { payment: { id: paymentId } },
      relations: ['payment', 'property', 'owner', 'tenant'],
      order: { generatedAt: 'DESC' }
    });
  }

  async getReceiptsByProperty(propertyId: number): Promise<Receipt[]> {
    return this.receiptRepository.find({
      where: { property: { id: propertyId } },
      relations: ['payment', 'property', 'owner', 'tenant'],
      order: { generatedAt: 'DESC' }
    });
  }

  async getReceiptsByTenant(tenantId: number): Promise<Receipt[]> {
    return this.receiptRepository.find({
      where: { tenant: { id: tenantId } },
      relations: ['payment', 'property', 'owner', 'tenant'],
      order: { generatedAt: 'DESC' }
    });
  }

  async getReceiptsByOwner(ownerId: number): Promise<Receipt[]> {
    return this.receiptRepository.find({
      where: { owner: { id: ownerId } },
      relations: ['payment', 'property', 'owner', 'tenant'],
      order: { generatedAt: 'DESC' }
    });
  }

  async getAllReceipts(propertyId?: number, tenantId?: number, ownerId?: number): Promise<Receipt[]> {
    const queryBuilder = this.receiptRepository
      .createQueryBuilder('receipt')
      .leftJoinAndSelect('receipt.payment', 'payment')
      .leftJoinAndSelect('receipt.property', 'property')
      .leftJoinAndSelect('receipt.owner', 'owner')
      .leftJoinAndSelect('receipt.tenant', 'tenant')
      .orderBy('receipt.generatedAt', 'DESC');

    if (propertyId) {
      queryBuilder.andWhere('property.id = :propertyId', { propertyId });
    }

    if (tenantId) {
      queryBuilder.andWhere('tenant.id = :tenantId', { tenantId });
    }

    if (ownerId) {
      queryBuilder.andWhere('owner.id = :ownerId', { ownerId });
    }

    return queryBuilder.getMany();
  }
} 