import { Address, Enrollment } from '@prisma/client';
import { request } from '@/utils/request';
import { notFoundError, requestError } from '@/errors';
import { addressRepository, CreateAddressParams, enrollmentRepository, CreateEnrollmentParams } from '@/repositories';
import { exclude } from '@/utils/prisma-utils';
import { AxiosResponse } from 'axios';
import { AddressCep } from '@/protocols';
import { inexistentError } from '@/errors/bad-request';


  async function validateCEP(cep: string) {
    const result: AxiosResponse = await request.get(`${process.env.VIA_CEP_API}/${cep}/json/`);

    if (result.status === 200) {
      if (result.data.erro === true) {
        throw inexistentError(`cep ${cep} inexistent`);
      } else {
        return result.data;
      }
    } else if (result.status === 400) {
      throw inexistentError(`cep ${cep} inexistent`);
    }
    return result.data;
  }

  // TODO - Receber o CEP por parâmetro nesta função.
  async function getAddressFromCEP(cep: string): Promise<AddressCep> {
  // FIXME: está com CEP fixo!
  const result: AxiosResponse = await request.get(`${process.env.VIA_CEP_API}/${cep}/json/`);

  const { logradouro, complemento, bairro, localidade, uf } = result.data;

  // TODO: Tratar regras de negócio e lanças eventuais erros
  //pode não conter complemento
  if (!logradouro || !bairro || !localidade || !uf) {
    throw inexistentError(`cep ${cep} inexistent`);
  }

  if (result.data.erro) throw inexistentError('cep');
  // FIXME: não estamos interessados em todos os campos
  const adress: AddressCep = { logradouro, complemento, bairro, localidade, uf };
  return adress;
}

async function getOneWithAddressByUserId(userId: number): Promise<GetOneWithAddressByUserIdResult> {
  const enrollmentWithAddress = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollmentWithAddress) throw notFoundError();

  const [firstAddress] = enrollmentWithAddress.Address;
  const address = getFirstAddress(firstAddress);

  return {
    ...exclude(enrollmentWithAddress, 'userId', 'createdAt', 'updatedAt', 'Address'),
    ...(!!address && { address }),
  };
}

type GetOneWithAddressByUserIdResult = Omit<Enrollment, 'userId' | 'createdAt' | 'updatedAt'>;

function getFirstAddress(firstAddress: Address): GetAddressResult {
  if (!firstAddress) return null;

  return exclude(firstAddress, 'createdAt', 'updatedAt', 'enrollmentId');
}

type GetAddressResult = Omit<Address, 'createdAt' | 'updatedAt' | 'enrollmentId'>;

async function createOrUpdateEnrollmentWithAddress(params: CreateOrUpdateEnrollmentWithAddress) {
  const enrollment = exclude(params, 'address');
  
  enrollment.birthday = new Date(enrollment.birthday);
  const address = getAddressForUpsert(params.address);

  // TODO - Verificar se o CEP é válido antes de associar ao enrollment.
  await validateCEP(address.cep)

  const newEnrollment = await enrollmentRepository.upsert(params.userId, enrollment, exclude(enrollment, 'userId'));

  await addressRepository.upsert(newEnrollment.id, address, address);
}

function getAddressForUpsert(address: CreateAddressParams) {
  return {
    ...address,
    ...(address?.addressDetail && { addressDetail: address.addressDetail }),
  };
}

export type CreateOrUpdateEnrollmentWithAddress = CreateEnrollmentParams & {
  address: CreateAddressParams;
};

export const enrollmentsService = {
  getOneWithAddressByUserId,
  createOrUpdateEnrollmentWithAddress,
  getAddressFromCEP,
};
