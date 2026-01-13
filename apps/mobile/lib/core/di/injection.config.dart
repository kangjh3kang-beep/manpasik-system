// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// InjectableConfigGenerator
// **************************************************************************

// ignore_for_file: type=lint
// coverage:ignore-file

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:dio/dio.dart' as _i361;
import 'package:get_it/get_it.dart' as _i174;
import 'package:injectable/injectable.dart' as _i526;

import '../../data/datasources/local/measurement_local_datasource.dart'
    as _i691;
import '../../data/datasources/remote/ai_remote_datasource.dart' as _i256;
import '../../data/repositories/ai_repository_impl.dart' as _i434;
import '../../data/repositories/bluetooth_repository_impl.dart' as _i785;
import '../../data/repositories/measurement_repository_impl.dart' as _i838;
import '../../data/repositories/nfc_repository_impl.dart' as _i32;
import '../../domain/repositories/ai_repository.dart' as _i185;
import '../../domain/repositories/bluetooth_repository.dart' as _i579;
import '../../domain/repositories/nfc_repository.dart' as _i902;
import '../../features/measurement/presentation/bloc/measurement_bloc.dart'
    as _i336;
import '../../services/bluetooth/bluetooth_service.dart' as _i138;
import '../../services/nfc/nfc_service.dart' as _i105;
import 'register_module.dart' as _i291;

extension GetItInjectableX on _i174.GetIt {
// initializes the registration of main-scope dependencies inside of GetIt
  _i174.GetIt init({
    String? environment,
    _i526.EnvironmentFilter? environmentFilter,
  }) {
    final gh = _i526.GetItHelper(
      this,
      environment,
      environmentFilter,
    );
    final registerModule = _$RegisterModule();
    final aIRemoteDataSourceModule = _$AIRemoteDataSourceModule();
    gh.singleton<_i138.BluetoothService>(
      () => _i138.BluetoothService(),
      dispose: (i) => i.dispose(),
    );
    gh.singleton<_i105.NfcService>(
      () => _i105.NfcService(),
      dispose: (i) => i.dispose(),
    );
    gh.singleton<_i361.Dio>(() => registerModule.dio);
    gh.factory<_i902.NfcRepository>(
        () => _i32.NfcRepositoryImpl(gh<_i105.NfcService>()));
    gh.singleton<_i256.AIRemoteDataSource>(() =>
        aIRemoteDataSourceModule.provideAIRemoteDataSource(gh<_i361.Dio>()));
    gh.singleton<_i691.MeasurementLocalDataSource>(
        () => _i691.MeasurementLocalDataSourceImpl());
    gh.factory<_i838.MeasurementRepository>(() =>
        _i838.MeasurementRepositoryImpl(
            gh<_i691.MeasurementLocalDataSource>()));
    gh.factory<_i579.BluetoothRepository>(
        () => _i785.BluetoothRepositoryImpl(gh<dynamic>()));
    gh.factory<_i185.AIRepository>(
        () => _i434.AIRepositoryImpl(gh<_i256.AIRemoteDataSource>()));
    gh.factory<_i336.MeasurementBloc>(() => _i336.MeasurementBloc(
          bluetoothRepository: gh<_i579.BluetoothRepository>(),
          nfcRepository: gh<_i902.NfcRepository>(),
          localDataSource: gh<_i691.MeasurementLocalDataSource>(),
          aiRepository: gh<_i185.AIRepository>(),
        ));
    return this;
  }
}

class _$RegisterModule extends _i291.RegisterModule {}

class _$AIRemoteDataSourceModule extends _i256.AIRemoteDataSourceModule {}
