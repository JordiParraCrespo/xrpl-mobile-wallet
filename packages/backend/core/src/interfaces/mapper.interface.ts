export interface Mapper<Entity, ServiceModel, ResponseDto> {
  toRepository(data: any): Entity;
  toService(entity: Entity): ServiceModel;
  toController(model: ServiceModel): ResponseDto;
}
